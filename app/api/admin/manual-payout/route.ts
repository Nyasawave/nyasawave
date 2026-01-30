import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * POST /api/admin/manual-payout
 * Admin manually credits user account
 * All actions are logged and audited
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!admin || !admin.roles?.includes('ADMIN')) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { userId, amount, reason = 'Admin manual adjustment' } = body;

        if (!userId || !amount || amount <= 0) {
            return NextResponse.json(
                { error: 'userId and positive amount required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (!user.wallet) {
            return NextResponse.json(
                { error: 'User wallet not found' },
                { status: 404 }
            );
        }

        // Update wallet
        const newBalance = user.wallet.balance + amount;
        const updatedWallet = await prisma.wallet.update({
            where: { userId },
            data: {
                balance: newBalance,
                totalEarned: user.wallet.totalEarned + amount,
            },
        });

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                type: 'DEPOSIT',
                status: 'COMPLETED',
                amount,
                currency: user.wallet.currency,
                description: `Admin manual payout: ${reason}`,
                paymentMethod: 'admin_manual',
                completedAt: new Date(),
            },
        });

        // Log admin action
        await prisma.auditLog.create({
            data: {
                adminId: admin.id,
                action: 'manual_payout',
                target: userId,
                targetType: 'wallet',
                details: {
                    amount,
                    reason,
                    newBalance,
                    transactionId: transaction.id,
                    timestamp: new Date().toISOString(),
                },
            },
        });

        // Notify user
        await prisma.notification.create({
            data: {
                userId,
                type: 'payment',
                title: 'Manual Credit Received',
                message: `${user.wallet.currency} ${amount} has been credited to your account. Reason: ${reason}`,
                relatedId: transaction.id,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Manual payout processed successfully',
            wallet: {
                balance: updatedWallet.balance,
                currency: updatedWallet.currency,
                totalEarned: updatedWallet.totalEarned,
            },
            transaction,
        });
    } catch (error) {
        console.error('Error processing manual payout:', error);
        return NextResponse.json(
            { error: 'Failed to process manual payout' },
            { status: 500 }
        );
    }
}
