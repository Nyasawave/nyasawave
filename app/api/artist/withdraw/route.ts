import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';

interface Withdrawal {
    id: string;
    artistId: string;
    amount: number;
    currency: string;
    method: 'airtel_money' | 'tnm_mpamba' | 'bank_transfer';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    phoneNumber?: string;
    bankAccount?: string;
    requestedAt: string;
    processedAt?: string;
    failureReason?: string;
}

const DATA_DIR = join(process.cwd(), 'data');
const WITHDRAWALS_FILE = join(DATA_DIR, 'withdrawals.json');
const REVENUE_FILE = join(DATA_DIR, 'revenue.json');

const MIN_WITHDRAWAL = 10; // Minimum $10 withdrawal

function readWithdrawals(): Withdrawal[] {
    try {
        const data = readFileSync(WITHDRAWALS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeWithdrawals(withdrawals: Withdrawal[]) {
    writeFileSync(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
}

function calculateAvailableBalance(artistId: string): number {
    try {
        const revenue = JSON.parse(readFileSync(REVENUE_FILE, 'utf-8')) || [];
        const artistRevenue = revenue.filter((r: any) => r.artistId === artistId);
        const totalEarned = artistRevenue.reduce((sum: number, r: any) => sum + r.amount, 0);

        const withdrawals = readWithdrawals();
        const completedWithdrawals = withdrawals
            .filter((w: any) => w.artistId === artistId && w.status === 'completed')
            .reduce((sum: number, w: any) => sum + w.amount, 0);

        return totalEarned - completedWithdrawals;
    } catch {
        return 0;
    }
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'ARTIST') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const withdrawals = readWithdrawals();
        const artistWithdrawals = withdrawals.filter(w => w.artistId === payload.userId);
        const availableBalance = calculateAvailableBalance(payload.userId);

        return NextResponse.json({
            ok: true,
            availableBalance,
            withdrawals: artistWithdrawals.slice(-10).reverse(),
            totalRequested: artistWithdrawals
                .filter(w => w.status === 'pending' || w.status === 'processing')
                .reduce((sum, w) => sum + w.amount, 0),
            totalWithdrawn: artistWithdrawals
                .filter(w => w.status === 'completed')
                .reduce((sum, w) => sum + w.amount, 0),
        });
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
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
        const { amount, method, phoneNumber, bankAccount, currency = 'USD' } = body;

        // Validation
        if (!amount || !method || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid withdrawal request' },
                { status: 400 }
            );
        }

        if (amount < MIN_WITHDRAWAL) {
            return NextResponse.json(
                { error: `Minimum withdrawal amount is $${MIN_WITHDRAWAL}` },
                { status: 400 }
            );
        }

        if (!['airtel_money', 'tnm_mpamba', 'bank_transfer'].includes(method)) {
            return NextResponse.json(
                { error: 'Invalid withdrawal method' },
                { status: 400 }
            );
        }

        // Check available balance
        const availableBalance = calculateAvailableBalance(payload.userId);
        if (amount > availableBalance) {
            return NextResponse.json(
                { error: `Insufficient balance. Available: $${availableBalance.toFixed(2)}` },
                { status: 400 }
            );
        }

        // Validate method-specific fields
        if (method === 'airtel_money' || method === 'tnm_mpamba') {
            if (!phoneNumber) {
                return NextResponse.json(
                    { error: 'Phone number required for mobile money' },
                    { status: 400 }
                );
            }
        }

        if (method === 'bank_transfer') {
            if (!bankAccount) {
                return NextResponse.json(
                    { error: 'Bank account required for bank transfer' },
                    { status: 400 }
                );
            }
        }

        // Create withdrawal request
        const withdrawals = readWithdrawals();
        const newWithdrawal: Withdrawal = {
            id: `WD-${Date.now()}`,
            artistId: payload.userId,
            amount,
            currency,
            method: method as any,
            status: 'pending',
            phoneNumber: method !== 'bank_transfer' ? phoneNumber : undefined,
            bankAccount: method === 'bank_transfer' ? bankAccount : undefined,
            requestedAt: new Date().toISOString(),
        };

        withdrawals.push(newWithdrawal);
        writeWithdrawals(withdrawals);

        return NextResponse.json({
            ok: true,
            withdrawal: newWithdrawal,
            message: `Withdrawal of ${currency} ${amount.toFixed(2)} requested via ${method}. Processing time: 1-2 hours.`,
            estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        }, { status: 201 });
    } catch (error) {
        console.error('Withdrawal error:', error);
        return NextResponse.json(
            { error: 'Withdrawal failed. Please try again.' },
            { status: 500 }
        );
    }
}
