import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/player/queue
 * Get current playback queue
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Return user's queue - in production, query from Prisma
        return NextResponse.json({
            currentTrackId: 'track-1',
            queue: [
                {
                    id: 'track-1',
                    title: 'Song 1',
                    artist: 'Artist 1',
                    duration: 240,
                },
            ],
            currentTime: 0,
            isPlaying: false,
        });
    } catch (error) {
        console.error('[API] Error fetching queue:', error);
        return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 });
    }
}

/**
 * POST /api/player/queue
 * Add tracks to queue or update playback state
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { trackId, action, currentTime } = body;

        // Log play history
        if (action === 'play') {
            // Save to Prisma PlayHistory
        }

        return NextResponse.json({
            success: true,
            queue: [],
            currentTrackId: trackId,
        });
    } catch (error) {
        console.error('[API] Error updating queue:', error);
        return NextResponse.json({ error: 'Failed to update queue' }, { status: 500 });
    }
}
