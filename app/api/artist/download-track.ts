import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB = path.join(process.cwd(), 'data', 'tracks.json');
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

function readTracks() {
  try {
    return JSON.parse(fs.readFileSync(DB, 'utf-8')) || [];
  } catch (e) {
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const trackId = url.searchParams.get('trackId');

    if (!trackId) {
      return NextResponse.json(
        { error: 'Missing track ID' },
        { status: 400 }
      );
    }

    const tracks = readTracks();
    const track = tracks.find((t: any) => t.id === trackId);

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    if (!track.playable) {
      return NextResponse.json(
        { error: 'Track is not available for download' },
        { status: 403 }
      );
    }

    // Create a synthetic audio file response for demo
    // In production, you would serve the actual uploaded file
    const audioBuffer = Buffer.from(
      `Audio data for: ${track.title} by ${track.artist}`
    );

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${track.title.replace(/[^a-z0-9]/gi, '_')}.mp3"`,
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('Download error:', err);
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    );
  }
}
