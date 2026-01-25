import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';
import type { User, WithdrawalData } from '@/types';

type RevenueData = { artistId: string; amount: number; date: string };
type StreamData = { trackId: string; streams: number; date: string };

const DATA_DIR = join(process.cwd(), 'data');

function isAdmin(email: string): boolean {
    return email === process.env.ADMIN_EMAIL;
}

function loadUsers(): User[] {
    const file = join(DATA_DIR, 'users.json');
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, 'utf-8'));
}

function loadRevenue(): RevenueData[] {
    const file = join(DATA_DIR, 'revenue.json');
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, 'utf-8'));
}

function loadWithdrawals(): WithdrawalData[] {
    const file = join(DATA_DIR, 'withdrawals.json');
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, 'utf-8'));
}

function loadStreams(): StreamData[] {
    const file = join(DATA_DIR, 'streams.json');
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, 'utf-8'));
}

function loadTracks(): any[] {
    const file = join(DATA_DIR, 'songs.json');
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, 'utf-8'));
}

function saveWithdrawals(withdrawals: any[]) {
    const file = join(DATA_DIR, 'withdrawals.json');
    writeFileSync(file, JSON.stringify(withdrawals, null, 2));
}

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
        const user = loadUsers().find((u: any) => u.id === decoded.userId);

        if (!user || !isAdmin(user.email)) {
            return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
        }

        const reportType = req.nextUrl.searchParams.get('type'); // 'summary', 'revenue', 'payouts', 'users'

        const revenue = loadRevenue();
        const withdrawals = loadWithdrawals();
        const users = loadUsers();
        const streams = loadStreams();
        const tracks = loadTracks();

        if (reportType === 'summary') {
            const totalRevenue = revenue.reduce((sum: number, r: any) => sum + r.amount, 0);
            const totalWithdrawn = withdrawals
                .filter((w: any) => w.status === 'COMPLETED')
                .reduce((sum: number, w: any) => sum + w.amount, 0);
            const availableBalance = totalRevenue - totalWithdrawn;

            return NextResponse.json({
                ok: true,
                summary: {
                    totalRevenue: totalRevenue.toFixed(2),
                    totalWithdrawn: totalWithdrawn.toFixed(2),
                    availableBalance: availableBalance.toFixed(2),
                    activeArtists: users.filter((u: any) => u.role === 'ARTIST').length,
                    activeListeners: users.filter((u: any) => u.role === 'LISTENER').length,
                    totalStreams: streams.length,
                    validStreams: streams.filter((s: any) => s.isValid).length,
                    totalTracks: tracks.length,
                },
            });
        }

        if (reportType === 'revenue') {
            const bySource: any = {};
            revenue.forEach((r: any) => {
                bySource[r.source] = (bySource[r.source] || 0) + r.amount;
            });

            const recentRevenue = revenue.slice(-50).reverse();

            return NextResponse.json({
                ok: true,
                revenue: {
                    bySource,
                    total: revenue.reduce((sum: number, r: any) => sum + r.amount, 0).toFixed(2),
                    recent: recentRevenue,
                },
            });
        }

        if (reportType === 'payouts') {
            const byStatus: any = {};
            withdrawals.forEach((w: any) => {
                byStatus[w.status] = (byStatus[w.status] || 0) + 1;
            });

            const pendingPayouts = withdrawals.filter((w: any) => w.status === 'PENDING');
            const totalPending = pendingPayouts.reduce((sum: number, w: any) => sum + w.amount, 0);

            return NextResponse.json({
                ok: true,
                payouts: {
                    byStatus,
                    totalPending: totalPending.toFixed(2),
                    pendingCount: pendingPayouts.length,
                    recent: withdrawals.slice(-50).reverse(),
                },
            });
        }

        if (reportType === 'users') {
            const artistCount = users.filter((u: any) => u.role === 'ARTIST').length;
            const listenerCount = users.filter((u: any) => u.role === 'LISTENER').length;
            const businessCount = users.filter((u: any) => u.role === 'BUSINESS').length;

            return NextResponse.json({
                ok: true,
                users: {
                    totalUsers: users.length,
                    artists: artistCount,
                    listeners: listenerCount,
                    businesses: businessCount,
                    banned: users.filter((u: any) => u.isBanned).length,
                    recent: users.slice(-50).reverse(),
                },
            });
        }

        // Default: full dashboard
        const totalRevenue = revenue.reduce((sum: number, r: any) => sum + r.amount, 0);
        const totalWithdrawn = withdrawals
            .filter((w: any) => w.status === 'COMPLETED')
            .reduce((sum: number, w: any) => sum + w.amount, 0);

        return NextResponse.json({
            ok: true,
            dashboard: {
                summary: {
                    totalRevenue: totalRevenue.toFixed(2),
                    totalWithdrawn: totalWithdrawn.toFixed(2),
                    availableBalance: (totalRevenue - totalWithdrawn).toFixed(2),
                    activeArtists: users.filter((u: any) => u.role === 'ARTIST').length,
                    totalStreams: streams.filter((s: any) => s.isValid).length,
                },
                topArtists: users
                    .filter((u: any) => u.role === 'ARTIST')
                    .map((a: any) => ({
                        name: a.name,
                        id: a.id,
                        totalEarnings: revenue.filter((r: any) => r.artistId === a.id).reduce((sum: number, r: any) => sum + r.amount, 0),
                    }))
                    .sort((a: any, b: any) => b.totalEarnings - a.totalEarnings)
                    .slice(0, 10),
                recentTransactions: revenue.slice(-20).reverse(),
                pendingWithdrawals: withdrawals.filter((w: any) => w.status === 'PENDING'),
            },
        });
    } catch (error) {
        console.error('[ADMIN DASHBOARD ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
        const user = loadUsers().find((u: any) => u.id === decoded.userId);

        if (!user || !isAdmin(user.email)) {
            return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
        }

        const body = await req.json();
        const { action, withdrawalId, status, streamRate } = body;

        // Approve/reject withdrawal
        if (action === 'process_withdrawal') {
            const withdrawals = loadWithdrawals();
            const withdrawal = withdrawals.find((w: WithdrawalData) => w.id === withdrawalId);

            if (!withdrawal) {
                return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
            }

            if (!['APPROVED', 'REJECTED'].includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }

            withdrawal.status = status as 'APPROVED' | 'REJECTED';
            withdrawal.processedAt = new Date().toISOString();
            saveWithdrawals(withdrawals);

            return NextResponse.json({
                ok: true,
                withdrawal,
                message: `Withdrawal ${status.toLowerCase()}`,
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[ADMIN ACTION ERROR]', error);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}
