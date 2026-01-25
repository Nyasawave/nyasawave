import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Return mock data
        return NextResponse.json([
            {
                id: '1',
                title: 'Sample Track',
                artist: 'Test Artist',
                type: 'track',
                status: 'active',
                streams: 1250,
                flaggedCount: 0,
                uploadedAt: new Date().toISOString(),
            },
        ]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create content' }, { status: 400 });
    }
}
