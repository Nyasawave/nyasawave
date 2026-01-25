import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/wallet - Get user's wallet and balance
 * Returns wallet balance, total earned, total spent
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { wallet: true },
        });

        if (!user || !user.wallet) {
            return NextResponse.json(
                { error: 'Wallet not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            wallet: {
                id: user.wallet.id,
                balance: user.wallet.balance,
                currency: user.wallet.currency,
                totalEarned: user.wallet.totalEarned,
                totalSpent: user.wallet.totalSpent,
                lastUpdated: user.wallet.updatedAt,
            },
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/wallet - Update wallet (admin only)
 * Body: { amount, type: "add" | "subtract", reason }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if admin
        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser?.roles?.includes('ADMIN')) {
            return NextResponse.json(
                { error: 'Only admins can update wallets' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { userId, amount, type, reason } = body;

        if (!userId || !amount || !type || !reason) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, amount, type, reason' },
                { status: 400 }
            );
        }

        const wallet = await prisma.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            return NextResponse.json(
                { error: 'Wallet not found' },
                { status: 404 }
            );
        }

        const newBalance =
            type === 'add' ? wallet.balance + amount : wallet.balance - amount;

        if (newBalance < 0) {
            return NextResponse.json(
                { error: 'Insufficient balance' },
                { status: 400 }
            );
        }

        // Update wallet and create transaction
        const [updatedWallet, transaction] = await Promise.all([
            prisma.wallet.update({
                where: { userId },
                data: { balance: newBalance },
            }),
            prisma.transaction.create({
                data: {
                    userId,
                    type: type === 'add' ? 'DEPOSIT' : 'WITHDRAWAL',
                    status: 'COMPLETED',
                    amount,
                    currency: wallet.currency,
                    description: reason,
                    completedAt: new Date(),
                },
            }),
        ]);

        // Log admin action
        await prisma.auditLog.create({
            data: {
                adminId: adminUser.id,
                action: `wallet_${type}`,
                target: userId,
                targetType: 'wallet',
                details: {
                    amount,
                    reason,
                    oldBalance: wallet.balance,
                    newBalance,
                    transactionId: transaction.id,
                },
            },
        });

        return NextResponse.json({
            wallet: {
                id: updatedWallet.id,
                balance: updatedWallet.balance,
                currency: updatedWallet.currency,
                totalEarned: updatedWallet.totalEarned,
                totalSpent: updatedWallet.totalSpent,
            },
            transaction,
        });
    } catch (error) {
        console.error('Error updating wallet:', error);
        return NextResponse.json(
            { error: 'Failed to update wallet' },
            { status: 500 }
        );
    }
}
