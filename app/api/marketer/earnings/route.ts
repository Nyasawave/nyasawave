import { NextResponse } from 'next/server';

export async function GET() {
    try {
        return NextResponse.json({ totalEarned: 0, thisMonth: 0, pending: 0 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
    }
}
