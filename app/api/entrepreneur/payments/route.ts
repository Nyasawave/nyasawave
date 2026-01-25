import { NextResponse } from 'next/server';

export async function GET() {
    try {
        return NextResponse.json([]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}
