import { NextResponse } from 'next/server';
import { songs } from '@/data/songs';

export async function GET() {
  return NextResponse.json(songs);
}

export async function POST(req: Request) {
  try {
    const newSong = await req.json();
    const id = `song-${Date.now()}`;
    return NextResponse.json({ ...newSong, id });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
