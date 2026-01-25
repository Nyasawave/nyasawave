import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB = path.join(process.cwd(), 'data', 'earnings.json');

function readEarnings() {
  try {
    if (!fs.existsSync(DB)) {
      return {};
    }
    return JSON.parse(fs.readFileSync(DB, 'utf-8')) || {};
  } catch (e) {
    return {};
  }
}

function writeEarnings(earnings: any) {
  const dir = path.dirname(DB);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB, JSON.stringify(earnings, null, 2));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const artistId = url.searchParams.get('artistId');

    if (!artistId) {
      return NextResponse.json({ error: 'Artist ID required' }, { status: 400 });
    }

    const earnings = readEarnings();
    const artistEarnings = earnings[artistId] || {
      totalEarnings: 0,
      totalStreams: 0,
      estimatedMonthlyEarnings: 0,
      recentTransactions: [],
    };

    return NextResponse.json(artistEarnings);
  } catch (err) {
    console.error('Fetch earnings error:', err);
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { artistId, amount, type } = body;

    if (!artistId) {
      return NextResponse.json({ error: 'Artist ID required' }, { status: 400 });
    }

    const earnings = readEarnings();

    if (!earnings[artistId]) {
      earnings[artistId] = {
        totalEarnings: 0,
        totalStreams: 0,
        estimatedMonthlyEarnings: 0,
        recentTransactions: [],
      };
    }

    earnings[artistId].totalEarnings += amount || 0;
    earnings[artistId].recentTransactions.push({
      description: type || 'Stream royalty',
      amount: amount || 0,
      date: new Date().toISOString(),
    });

    writeEarnings(earnings);

    return NextResponse.json({ success: true, earnings: earnings[artistId] });
  } catch (err) {
    console.error('Update earnings error:', err);
    return NextResponse.json({ error: 'Failed to update earnings' }, { status: 500 });
  }
}
