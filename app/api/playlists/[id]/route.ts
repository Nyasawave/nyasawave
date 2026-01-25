import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/playlists/[id]
 * Get a specific playlist with tracks
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: playlistId } = await params;

        return NextResponse.json({
            id: playlistId,
            name: 'Sample Playlist',
            description: 'A collection of great songs',
            tracks: [
                {
                    id: 'track-1',
                    title: 'Sample Song 1',
                    artist: 'Artist Name',
                    duration: 240,
                },
            ],
            createdAt: new Date(),
        });
    } catch (error) {
        console.error('[API] Error fetching playlist:', error);
        return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
    }
}

/**
 * PUT /api/playlists/[id]
 * Update a playlist
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: playlistId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description } = body;

        return NextResponse.json({
            id: playlistId,
            name: name || 'Updated Playlist',
            description: description || '',
            updatedAt: new Date(),
        });
    } catch (error) {
        console.error('[API] Error updating playlist:', error);
        return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
    }
}

/**
 * DELETE /api/playlists/[id]
 * Delete a playlist
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: playlistId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({ success: true, id: playlistId });
    } catch (error) {
        console.error('[API] Error deleting playlist:', error);
        return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
    }
}
