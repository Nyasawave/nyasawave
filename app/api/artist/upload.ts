import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const songsFile = path.join(process.cwd(), 'data', 'uploaded-songs.json');

function ensureFile() {
  const dir = path.dirname(songsFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(songsFile)) {
    fs.writeFileSync(songsFile, JSON.stringify([]));
  }
}

function getUploadedSongs() {
  try {
    ensureFile();
    const data = fs.readFileSync(songsFile, 'utf-8');
    return JSON.parse(data) || [];
  } catch (e) {
    console.error('Read songs error:', e);
    return [];
  }
}

function saveSongs(uploadedSongs: any[]) {
  try {
    ensureFile();
    fs.writeFileSync(songsFile, JSON.stringify(uploadedSongs, null, 2));
    console.log('✓ Songs saved. Total songs:', uploadedSongs.length);
  } catch (e) {
    console.error('Save songs error:', e);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const artistId = formData.get('artistId') as string;
    const albumName = formData.get('albumName') as string;
    const genre = formData.get('genre') as string;
    const description = formData.get('description') as string;
    const composer = formData.get('composer') as string;
    const producer = formData.get('producer') as string;
    const releaseDate = formData.get('releaseDate') as string;
    const duration = formData.get('duration') as string;
    const copyrightHolder = formData.get('copyrightHolder') as string;
    const isOriginal = formData.get('isOriginal') === 'true';
    const copyrightStatus = formData.get('copyrightStatus') as string;

    console.log('Upload request received:', { title, artist, artistId });

    if (!title || !artist || !artistId) {
      return NextResponse.json(
        { error: 'Missing required: title, artist, artistId' },
        { status: 400 }
      );
    }

    // Parse duration MM:SS to seconds
    let durationSeconds = 180; // default 3 mins
    if (duration) {
      const parts = duration.split(':');
      if (parts.length === 2) {
        durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    }

    // Create song object
    const song = {
      id: crypto.randomBytes(8).toString('hex'),
      title,
      artist,
      artistId,
      album: albumName || 'Unknown Album',
      genre: genre || 'Unknown',
      src: '/audio/uploaded.mp3',
      streamUrl: '/audio/uploaded.mp3',
      cover: '/covers/default.jpg',
      duration: durationSeconds,
      plays: 0,
      likes: 0,
      // Additional metadata
      description: description || '',
      composer: composer || '',
      producer: producer || '',
      releaseDate: releaseDate || '',
      copyrightHolder: copyrightHolder || artist,
      isOriginal,
      copyrightStatus: copyrightStatus || 'unchecked',
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toLocaleDateString(),
      visible: true,
      playable: true,
    };

    // Save to file
    const uploadedSongs = getUploadedSongs();
    uploadedSongs.push(song);
    saveSongs(uploadedSongs);

    console.log('✓ Song saved successfully:', song.id, song.title);

    return NextResponse.json({ 
      ok: true, 
      song,
      message: 'Track uploaded successfully!' 
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

