import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs';
import path from 'path';

const uploadsFile = path.join(process.cwd(), 'data', 'uploaded-songs.json');

function getUploadedSongs() {
    try {
        if (fs.existsSync(uploadsFile)) {
            const data = fs.readFileSync(uploadsFile, 'utf-8');
            return JSON.parse(data) || [];
        }
        return [];
    } catch (e) {
        console.error('[API] Error reading uploaded songs:', e);
        return [];
    }
}

/**
 * GET /api/artist/tracks
 * Get artist's tracks from uploaded-songs.json
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is an artist
        if (!(session.user as any).roles?.includes('ARTIST')) {
            return NextResponse.json({ error: 'Not an artist' }, { status: 403 });
        }

        // Get query params - can filter by specific artistId or current user
        const searchParams = request.nextUrl.searchParams;
        const filterArtistId = searchParams.get('artistId');
        const artistId = filterArtistId || session.user.id;

        // Get all uploaded songs
        const allSongs = getUploadedSongs();

        // Filter by artistId - match both old hash-based IDs and new database IDs
        // For now, return all visible songs from this artist
        const tracks = allSongs.filter((song: any) =>
            song.artistId === artistId && song.visible !== false
        );

        console.log(`[API] Artist ${artistId} has ${tracks.length} visible tracks`);
        return NextResponse.json(tracks);
    } catch (error) {
        console.error('[API] Error fetching artist tracks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tracks' },
            { status: 500 }
        );
    }
}
