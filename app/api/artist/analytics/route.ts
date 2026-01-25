import { NextRequest, NextResponse } from 'next/server';

// Mock data - replace with real database queries
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const artistId = searchParams.get('artistId');

        if (!artistId) {
            return NextResponse.json({ error: 'Artist ID required' }, { status: 400 });
        }

        // TODO: Query real database for artist earnings
        const mockEarnings = {
            artistId,
            totalEarnings: {
                MWK: 15450,
                USD: 15.45,
            },
            totalStreams: 28940,
            monthlyEarnings: [
                { month: 'Oct', earnings: 3200, streams: 6400 },
                { month: 'Nov', earnings: 5600, streams: 11200 },
                { month: 'Dec', earnings: 6650, streams: 11340 },
            ],
            districtBreakdown: [
                { district: 'Lilongwe', streams: 8940, percentage: 31 },
                { district: 'Blantyre', streams: 6280, percentage: 21 },
                { district: 'Mzuzu', streams: 5420, percentage: 18 },
                { district: 'Zomba', streams: 4100, percentage: 14 },
            ],
            boostROI: 3.2,
            topSongs: [
                {
                    id: 'song-1',
                    title: 'Midnight Dreams',
                    streams: 8450,
                    earnings: 4225,
                    likes: 420,
                },
                {
                    id: 'song-2',
                    title: 'Summer Vibes',
                    streams: 12300,
                    earnings: 6150,
                    likes: 580,
                },
            ],
        };

        return NextResponse.json(mockEarnings);
    } catch (error) {
        console.error('Error fetching earnings:', error);
        return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
    }
}
