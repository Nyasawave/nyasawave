import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const stats = {
            totalUsers: 1247,
            totalArtists: 342,
            totalListeners: 8956,
            totalTracks: 5234,
            totalRevenue: 45230.75,
            pendingPayouts: 8750.25,
            activeDisputes: 3,
            failedTransactions: 12,
            activeAuctions: 7,
            totalTransactions: 2341,
            lastUpdated: new Date().toISOString(),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
