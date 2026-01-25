import { NextResponse } from 'next/server';
import { artists } from '@/data/artists';

export async function GET() {
  return NextResponse.json(artists);
}

export async function POST(req: Request) {
  try {
    const newArtist = await req.json();
    const id = `artist-${Date.now()}`;
    return NextResponse.json({ ...newArtist, id });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
