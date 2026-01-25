import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';

interface Revenue {
    id: string;
    artistId: string;
    source: 'stream' | 'ad_click' | 'subscription_share' | 'boost';
    amount: number;
    currency: string;
    trackId?: string;
    adId?: string;
    timestamp: string;
    details: string;
}

interface Earnings {
    totalEarned: number;
    totalPending: number;
    totalWithdrawn: number;
    bySource: {
        streams: number;
        adClicks: number;
        subscriptions: number;
        boosts: number;
    };
    recentTransactions: Revenue[];
}

const DATA_DIR = join(process.cwd(), 'data');
const REVENUE_FILE = join(DATA_DIR, 'revenue.json');

function readRevenue(): Revenue[] {
    try {
        const data = readFileSync(REVENUE_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeRevenue(revenue: Revenue[]) {
    writeFileSync(REVENUE_FILE, JSON.stringify(revenue, null, 2));
}

export async function GET(req: NextRequest) {
    try {
        // Verify artist token
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'ARTIST') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const revenue = readRevenue();
        const artistRevenue = revenue.filter(r => r.artistId === payload.userId);

        // Calculate earnings by source
        const earnings: Earnings = {
            totalEarned: artistRevenue.reduce((sum, r) => sum + r.amount, 0),
            totalPending: 0, // TODO: track pending transactions
            totalWithdrawn: 0, // TODO: read from withdrawals.json
            bySource: {
                streams: artistRevenue
                    .filter(r => r.source === 'stream')
                    .reduce((sum, r) => sum + r.amount, 0),
                adClicks: artistRevenue
                    .filter(r => r.source === 'ad_click')
                    .reduce((sum, r) => sum + r.amount, 0),
                subscriptions: artistRevenue
                    .filter(r => r.source === 'subscription_share')
                    .reduce((sum, r) => sum + r.amount, 0),
                boosts: artistRevenue
                    .filter(r => r.source === 'boost')
                    .reduce((sum, r) => sum + r.amount, 0),
            },
            recentTransactions: artistRevenue.slice(-10).reverse(),
        };

        return NextResponse.json({
            ok: true,
            earnings,
            currencyCode: 'USD',
            availableForWithdrawal: earnings.totalEarned - earnings.totalWithdrawn,
        });
    } catch (error) {
        console.error('Error fetching earnings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Verify artist token
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'ARTIST') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { source, amount, trackId, adId, details } = body;

        if (!source || !amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid revenue data' },
                { status: 400 }
            );
        }

        const revenue = readRevenue();
        const newRevenue: Revenue = {
            id: `rev_${Date.now()}`,
            artistId: payload.userId,
            source,
            amount,
            currency: 'USD',
            trackId: trackId || undefined,
            adId: adId || undefined,
            timestamp: new Date().toISOString(),
            details: details || `Revenue from ${source}`,
        };

        revenue.push(newRevenue);
        writeRevenue(revenue);

        return NextResponse.json({
            ok: true,
            message: 'Revenue recorded',
            revenue: newRevenue,
        }, { status: 201 });
    } catch (error) {
        console.error('Error recording revenue:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
