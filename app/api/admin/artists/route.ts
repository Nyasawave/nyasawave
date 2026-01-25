import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/artists
 * Get all artists with filters
 * Admin only
 */
export async function GET(req: NextRequest) {
    try {
        // Get query parameters
        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get('status') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Mock data
        const mockArtists = [
            {
                id: 'artist_1',
                name: 'Artist One',
                email: 'artist1@test.com',
                verified: true,
                streams: 125000,
                tracks: 42,
                earnings: 3250.50,
                createdAt: '2026-01-01T00:00:00Z',
            },
            {
                id: 'artist_2',
                name: 'Artist Two',
                email: 'artist2@test.com',
                verified: true,
                streams: 98500,
                tracks: 28,
                earnings: 2180.25,
                createdAt: '2026-01-02T00:00:00Z',
            },
            {
                id: 'artist_3',
                name: 'Artist Three',
                email: 'artist3@test.com',
                verified: false,
                streams: 45000,
                tracks: 15,
                earnings: 950.75,
                createdAt: '2026-01-03T00:00:00Z',
            },
        ];

        const filtered = status === 'all'
            ? mockArtists
            : status === 'verified'
                ? mockArtists.filter(a => a.verified)
                : mockArtists.filter(a => !a.verified);

        const start = (page - 1) * limit;
        const end = start + limit;
        const pageData = filtered.slice(start, end);

        return NextResponse.json({
            success: true,
            data: pageData,
            pagination: {
                page,
                limit,
                total: filtered.length,
                pages: Math.ceil(filtered.length / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching artists:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
