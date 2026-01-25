import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Return mock data
        return NextResponse.json([
            {
                id: '1',
                name: 'Weekly Challenge',
                type: 'WEEKLY',
                status: 'active',
                entryFee: 5,
                prizePool: 500,
                participants: 45,
                startDate: new Date().toISOString(),
            },
        ]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create tournament' }, { status: 400 });
    }
}
