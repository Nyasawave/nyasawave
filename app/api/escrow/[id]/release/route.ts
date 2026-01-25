import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/escrow/[id]/release
 * Release escrow to seller (seller confirms delivery or order complete)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: escrowId } = await params;
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const escrow = await prisma.escrow.findUnique({
            where: { id: escrowId },
        });

        if (!escrow) {
            return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
        }

        // Only seller or admin can release escrow
        if (user.id !== escrow.sellerId && !user.roles?.includes('ADMIN')) {
            return NextResponse.json(
                { error: 'Only seller or admin can release escrow' },
                { status: 403 }
            );
        }

        if (escrow.status !== 'held') {
            return NextResponse.json(
                { error: `Cannot release escrow with status: ${escrow.status}` },
                { status: 400 }
            );
        }

        // Update escrow status
        const updatedEscrow = await prisma.escrow.update({
            where: { id: escrowId },
            data: {
                status: 'released',
                releasedAt: new Date(),
            },
        });

        // Credit seller wallet
        const sellerWallet = await prisma.wallet.findUnique({
            where: { userId: escrow.sellerId },
        });

        if (sellerWallet) {
            const newBalance = sellerWallet.balance + escrow.amount;
            await prisma.wallet.update({
                where: { userId: escrow.sellerId },
                data: {
                    balance: newBalance,
                    totalEarned: sellerWallet.totalEarned + escrow.amount,
                },
            });
        }

        // Create transaction
        await prisma.transaction.create({
            data: {
                userId: escrow.sellerId,
                type: 'ESCROW_RELEASE',
                status: 'COMPLETED',
                amount: escrow.amount,
                currency: escrow.currency,
                description: `Escrow released for order ${escrow.orderId}`,
                relatedId: escrowId,
                relatedType: 'escrow',
                completedAt: new Date(),
            },
        });

        // Create notifications
        await prisma.notification.create({
            data: {
                userId: escrow.sellerId,
                type: 'payment',
                title: 'Escrow Released',
                message: `${escrow.currency} ${escrow.amount} released to your wallet for order ${escrow.orderId}`,
                relatedId: escrowId,
            },
        });

        await prisma.notification.create({
            data: {
                userId: escrow.buyerId,
                type: 'payment',
                title: 'Order Completed',
                message: `Your order has been marked as complete. Seller received payment.`,
                relatedId: escrowId,
            },
        });

        return NextResponse.json({
            escrow: updatedEscrow,
            message: 'Escrow released successfully',
        });
    } catch (error) {
        console.error('Error releasing escrow:', error);
        return NextResponse.json(
            { error: 'Failed to release escrow' },
            { status: 500 }
        );
    }
}


