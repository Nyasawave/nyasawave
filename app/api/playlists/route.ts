import { NextResponse } from 'next/server';
import { playlists } from '@/data/playlists';

export async function GET() {
  return NextResponse.json(playlists);
}

export async function POST(req: Request) {
  try {
    const newPlaylist = await req.json();
    const id = `playlist-${Date.now()}`;
    return NextResponse.json({ ...newPlaylist, id });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
