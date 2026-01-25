import { NextResponse } from 'next/server';
import { albums } from '@/data/albums';

export async function GET() {
  return NextResponse.json(albums);
}

export async function POST(req: Request) {
  try {
    const newAlbum = await req.json();
    const id = `album-${Date.now()}`;
    return NextResponse.json({ ...newAlbum, id });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
