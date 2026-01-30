import { NextResponse } from 'next/server';
import { songs } from '../../../../data/songs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const songsFile = path.join(process.cwd(), 'data', 'uploaded-songs.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

function ensureFile() {
  const dir = path.dirname(songsFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(songsFile)) {
    fs.writeFileSync(songsFile, JSON.stringify([]));
  }
}

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
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
    console.log('✓ Songs saved. Total:', uploadedSongs.length);
  } catch (e) {
    console.error('Save songs error:', e);
  }
}

async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  ensureUploadsDir();
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, buffer);
  return `/uploads/${filename}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const artistId = url.searchParams.get('artistId');

    // Get both default songs and uploaded songs
    const uploadedSongs = getUploadedSongs();
    const allSongs = [...songs, ...uploadedSongs];

    const filtered = artistId ? allSongs.filter((s: any) => s.artistId === artistId) : allSongs;
    console.log('GET releases:', artistId, 'found:', filtered.length);
    return NextResponse.json(filtered);
  } catch (err) {
    console.error('GET error:', err);
    return NextResponse.json({ error: 'Failed to load songs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Verify artist auth using NextAuth
    const session = await getServerSession(authOptions);
    let artistId: string | null = null;

    // Check if user has ARTIST or ADMIN role in their roles array
    if ((session?.user as any)?.roles?.includes('ARTIST') || (session?.user as any)?.roles?.includes('ADMIN')) {
      artistId = (session?.user as any)?.id;
    }

    const body = await req.json();
    const { action, songId, scheduledAt, title, artist, artistId: bodyArtistId, albumName, genre, description, composer, producer, releaseDate, duration, copyrightHolder, isOriginal, copyrightStatus } = body;
    if (action === 'upload') {
      // Require auth for uploads
      if (!artistId && !bodyArtistId) {
        return NextResponse.json(
          { error: 'Authentication required to upload' },
          { status: 401 }
        );
      }

      console.log('Upload action:', title, artist, bodyArtistId || artistId);

      if (!title || !artist || (!bodyArtistId && !artistId)) {
        return NextResponse.json(
          { error: 'Missing required: title, artist, artistId' },
          { status: 400 }
        );
      }

      // Parse duration MM:SS to seconds
      let durationSeconds = 180;
      if (duration) {
        const parts = duration.split(':');
        if (parts.length === 2) {
          durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      }

      // Create song
      const song = {
        id: crypto.randomBytes(8).toString('hex'),
        title,
        artist,
        artistId: bodyArtistId || artistId,
        album: albumName || 'Unknown Album',
        genre: genre || 'Unknown',
        src: '/audio/uploaded.mp3',
        streamUrl: '/audio/uploaded.mp3',
        cover: '/covers/default.jpg',
        duration: durationSeconds,
        plays: 0,
        likes: 0,
        description: description || '',
        composer: composer || '',
        producer: producer || '',
        releaseDate: releaseDate || '',
        copyrightHolder: copyrightHolder || artist || 'Unknown',
        isOriginal: isOriginal !== false,
        copyrightStatus: copyrightStatus || 'unchecked',
        createdAt: new Date().toISOString(),
        uploadedAt: new Date().toLocaleDateString(),
        visible: true,
        playable: true,
      };

      const uploadedSongs = getUploadedSongs();
      uploadedSongs.push(song);
      saveSongs(uploadedSongs);

      console.log('✓ Song uploaded:', song.id, song.title);

      return NextResponse.json({ ok: true, song, message: 'Track uploaded successfully!' });
    }

    // Handle schedule action
    if (action === 'schedule' || scheduledAt) {
      let song = songs.find((s) => s.id === songId);

      if (!song) {
        const uploadedSongs = getUploadedSongs();
        song = uploadedSongs.find((s: any) => s.id === songId);

        if (song) {
          song.scheduledAt = scheduledAt;
          saveSongs(uploadedSongs);
        }
      } else {
        song.scheduledAt = scheduledAt;
      }

      if (!song) {
        return NextResponse.json({ error: 'Song not found' }, { status: 404 });
      }

      return NextResponse.json({ ok: true, song });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('POST error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
