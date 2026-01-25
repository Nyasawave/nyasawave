import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB = path.join(process.cwd(), 'data', 'tracks.json');

function readTracks() {
  try {
    if (!fs.existsSync(DB)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(DB, 'utf-8')) || [];
  } catch (e) {
    return [];
  }
}

function writeTracks(tracks: any[]) {
  fs.writeFileSync(DB, JSON.stringify(tracks, null, 2));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const artistId = url.searchParams.get('artistId');

    const tracks = readTracks();

    if (!artistId) {
      return NextResponse.json(tracks);
    }

    // Filter by artistId - only return tracks owned by this artist
    const filteredTracks = tracks.filter((track: any) => track.artistId === artistId);
    return NextResponse.json(filteredTracks);
  } catch (err) {
    console.error('Fetch tracks error:', err);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, songId, scheduledAt, hours, artistId, ...trackData } = body;

    const tracks = readTracks();

    // Handle upload
    if (action === 'upload') {
      const newTrack = {
        id: `track_${Date.now()}`,
        ...trackData,
        plays: 0,
        likes: 0,
        uploadedAt: new Date().toISOString(),
      };
      tracks.push(newTrack);
      writeTracks(tracks);
      return NextResponse.json({ ok: true, track: newTrack });
    }

    // Handle schedule
    if (action === 'schedule') {
      const track = tracks.find((t: any) => t.id === songId && t.artistId === artistId);
      if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 });
      track.scheduledAt = scheduledAt;
      writeTracks(tracks);
      return NextResponse.json({ ok: true, track });
    }

    // Handle boost
    if (action === 'boost') {
      const track = tracks.find((t: any) => t.id === songId && t.artistId === artistId);
      if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 });
      const now = new Date();
      const expire = new Date(now.getTime() + (Number(hours) || 24) * 60 * 60 * 1000);
      track.isBoosted = true;
      track.boostExpiresAt = expire.toISOString();
      writeTracks(tracks);
      return NextResponse.json({ ok: true, track });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('POST error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
