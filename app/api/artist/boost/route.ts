import { NextResponse } from 'next/server';
import { songs } from '../../../../data/songs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { songId, hours } = body;
        const song = songs.find((s) => s.id === songId);
        if (!song) return NextResponse.json({ error: 'Song not found' }, { status: 404 });
        const now = new Date();
        const expire = new Date(now.getTime() + (Number(hours) || 24) * 60 * 60 * 1000);
        song.isBoosted = true;
        song.boostExpiresAt = expire.toISOString();
        return NextResponse.json({ ok: true, song });
    } catch (err) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
