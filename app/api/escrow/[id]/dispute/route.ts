import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/escrow/[id]/dispute
 * Buyer initiates a dispute for an escrow holding
 * Body: { reason: string }
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

        const body = await req.json();
        const { reason } = body;

        if (!reason || reason.trim().length === 0) {
            return NextResponse.json(
                { error: 'Dispute reason required' },
                { status: 400 }
            );
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

        // Only buyer or admin can dispute
        if (user.id !== escrow.buyerId && !user.roles?.includes('ADMIN')) {
            return NextResponse.json(
                { error: 'Only buyer or admin can dispute escrow' },
                { status: 403 }
            );
        }

        if (escrow.status !== 'held') {
            return NextResponse.json(
                { error: `Cannot dispute escrow with status: ${escrow.status}` },
                { status: 400 }
            );
        }

        // Update escrow to disputed
        const updatedEscrow = await prisma.escrow.update({
            where: { id: escrowId },
            data: {
                status: 'disputed',
            },
        });

        // Get or create dispute record (using the Dispute model)
        const dispute = await prisma.dispute.findFirst({
            where: {
                order: {
                    id: escrow.orderId,
                },
            },
        });

        if (!dispute) {
            await prisma.dispute.create({
                data: {
                    orderId: escrow.orderId,
                    raisedBy: user.id,
                    description: reason,
                    status: 'open',
                },
            });
        } else {
            await prisma.dispute.update({
                where: { id: dispute.id },
                data: {
                    description: reason,
                    status: 'open',
                },
            });
        }

        // Notify admins
        const admins = await prisma.user.findMany({
            where: { roles: { has: 'ADMIN' } },
        });

        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: 'payment',
                    title: 'Escrow Dispute',
                    message: `Dispute raised for order ${escrow.orderId}. Reason: ${reason}`,
                    relatedId: escrowId,
                },
            });
        }

        // Notify seller
        await prisma.notification.create({
            data: {
                userId: escrow.sellerId,
                type: 'payment',
                title: 'Order Dispute',
                message: `Buyer has disputed order ${escrow.orderId}. Admin will review.`,
                relatedId: escrowId,
            },
        });

        return NextResponse.json({
            escrow: updatedEscrow,
            message: 'Dispute created. Admin will review.',
        });
    } catch (error) {
        console.error('Error creating dispute:', error);
        return NextResponse.json(
            { error: 'Failed to create dispute' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/escrow/[id]/dispute
 * Admin resolves a dispute
 * Body: { resolution: "refund_buyer" | "pay_seller", notes: string }
 */
export async function PUT(
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

        if (!user || !user.roles?.includes('ADMIN')) {
            return NextResponse.json(
                { error: 'Only admins can resolve disputes' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { resolution, notes } = body;

        if (!resolution || !['refund_buyer', 'pay_seller'].includes(resolution)) {
            return NextResponse.json(
                { error: 'Invalid resolution. Must be "refund_buyer" or "pay_seller"' },
                { status: 400 }
            );
        }

        const escrow = await prisma.escrow.findUnique({
            where: { id: escrowId },
        });

        if (!escrow) {
            return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
        }

        if (escrow.status !== 'disputed') {
            return NextResponse.json(
                { error: 'Escrow must be in disputed status' },
                { status: 400 }
            );
        }

        const updateData: any = {
            status: resolution === 'refund_buyer' ? 'refunded' : 'released',
            releasedAt: new Date(),
        };

        const updatedEscrow = await prisma.escrow.update({
            where: { id: escrowId },
            data: updateData,
        });

        // Update dispute
        const dispute = await prisma.dispute.findFirst({
            where: { orderId: escrow.orderId },
        });

        if (dispute) {
            await prisma.dispute.update({
                where: { id: dispute.id },
                data: {
                    status: 'resolved',
                    resolution: notes,
                    resolvedAt: new Date(),
                    resolvedBy: user.id,
                },
            });
        }

        if (resolution === 'refund_buyer') {
            // Refund to buyer
            const buyerWallet = await prisma.wallet.findUnique({
                where: { userId: escrow.buyerId },
            });

            if (buyerWallet) {
                const newBalance = buyerWallet.balance + escrow.amount;
                await prisma.wallet.update({
                    where: { userId: escrow.buyerId },
                    data: {
                        balance: newBalance,
                    },
                });
            }

            await prisma.transaction.create({
                data: {
                    userId: escrow.buyerId,
                    type: 'REFUND',
                    status: 'COMPLETED',
                    amount: escrow.amount,
                    currency: escrow.currency,
                    description: `Refund for disputed order ${escrow.orderId}. Reason: ${notes}`,
                    relatedId: escrowId,
                    relatedType: 'escrow',
                    completedAt: new Date(),
                },
            });

            await prisma.notification.create({
                data: {
                    userId: escrow.buyerId,
                    type: 'payment',
                    title: 'Dispute Resolved - Refunded',
                    message: `Your dispute has been resolved. ${escrow.currency} ${escrow.amount} has been refunded. ${notes}`,
                    relatedId: escrowId,
                },
            });

            await prisma.notification.create({
                data: {
                    userId: escrow.sellerId,
                    type: 'payment',
                    title: 'Dispute Resolved - Buyer Refunded',
                    message: `Dispute for order ${escrow.orderId} resolved. Buyer was refunded. ${notes}`,
                    relatedId: escrowId,
                },
            });
        } else {
            // Release to seller
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

            await prisma.transaction.create({
                data: {
                    userId: escrow.sellerId,
                    type: 'ESCROW_RELEASE',
                    status: 'COMPLETED',
                    amount: escrow.amount,
                    currency: escrow.currency,
                    description: `Dispute resolved in seller's favor for order ${escrow.orderId}. ${notes}`,
                    relatedId: escrowId,
                    relatedType: 'escrow',
                    completedAt: new Date(),
                },
            });

            await prisma.notification.create({
                data: {
                    userId: escrow.sellerId,
                    type: 'payment',
                    title: 'Dispute Resolved - Payment Released',
                    message: `Your dispute has been resolved in your favor. ${escrow.currency} ${escrow.amount} released. ${notes}`,
                    relatedId: escrowId,
                },
            });

            await prisma.notification.create({
                data: {
                    userId: escrow.buyerId,
                    type: 'payment',
                    title: 'Dispute Resolved - Against You',
                    message: `Your dispute for order ${escrow.orderId} was not upheld. Seller received payment. ${notes}`,
                    relatedId: escrowId,
                },
            });
        }

        // Log admin action
        await prisma.auditLog.create({
            data: {
                adminId: user.id,
                action: 'dispute_resolution',
                target: escrowId,
                targetType: 'escrow',
                details: {
                    escrowId,
                    orderId: escrow.orderId,
                    resolution,
                    notes,
                    amount: escrow.amount,
                    currency: escrow.currency,
                },
            },
        });

        return NextResponse.json({
            escrow: updatedEscrow,
            message: `Dispute resolved: ${resolution}`,
        });
    } catch (error) {
        console.error('Error resolving dispute:', error);
        return NextResponse.json(
            { error: 'Failed to resolve dispute' },
            { status: 500 }
        );
    }
}
