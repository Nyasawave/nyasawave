import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/payments/webhook
 * Webhook handler for payment confirmations from Stripe, Flutterwave, etc.
 * 
 * Verify signature, update payment status, release escrow if applicable
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, data, provider = 'stripe', signature } = body;

        // TODO: Verify webhook signature based on provider
        // if (!verifySignature(signature, rawBody, provider)) {
        //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        // }

        switch (type) {
            case 'payment.success':
            case 'charge.completed':
            case 'flutterwave.charge.success': {
                const { paymentId, transactionId, reference } = data;

                if (!paymentId) {
                    return NextResponse.json(
                        { error: 'Missing paymentId' },
                        { status: 400 }
                    );
                }

                // Update payment status
                const payment = await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: 'COMPLETED',
                        reference: reference || undefined,
                        transactionId: transactionId || undefined,
                    },
                    include: { user: true },
                });

                // Update transaction status
                await prisma.transaction.update({
                    where: { id: transactionId || `txn_${paymentId}` },
                    data: {
                        status: 'COMPLETED',
                        completedAt: new Date(),
                        transactionRef: reference,
                    },
                });

                // Credit user wallet
                const wallet = await prisma.wallet.findUnique({
                    where: { userId: payment.userId },
                });

                if (wallet) {
                    const newBalance = wallet.balance + payment.amount;
                    await prisma.wallet.update({
                        where: { userId: payment.userId },
                        data: {
                            balance: newBalance,
                            totalEarned: wallet.totalEarned + payment.amount,
                        },
                    });
                }

                // Create notification
                await prisma.notification.create({
                    data: {
                        userId: payment.userId,
                        type: 'payment',
                        title: 'Payment Successful',
                        message: `Your payment of ${payment.currency} ${payment.amount} has been processed successfully.`,
                        relatedId: paymentId,
                    },
                });

                console.log(`✅ Payment ${paymentId} completed`);
                return NextResponse.json({ success: true });
            }

            case 'payment.failed':
            case 'charge.failed':
            case 'flutterwave.charge.failed': {
                const { paymentId, reason } = data;

                if (!paymentId) {
                    return NextResponse.json(
                        { error: 'Missing paymentId' },
                        { status: 400 }
                    );
                }

                // Update payment status
                const payment = await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: 'FAILED',
                    },
                    include: { user: true },
                });

                // Create notification
                await prisma.notification.create({
                    data: {
                        userId: payment.userId,
                        type: 'payment',
                        title: 'Payment Failed',
                        message: `Your payment of ${payment.currency} ${payment.amount} failed: ${reason || 'Unknown reason'}`,
                        relatedId: paymentId,
                    },
                });

                console.log(`❌ Payment ${paymentId} failed: ${reason}`);
                return NextResponse.json({ success: true });
            }

            case 'escrow.released': {
                // Tournament prize released or marketplace order completed
                const { escrowId, amount, sellerId } = data;

                if (!escrowId || !amount || !sellerId) {
                    return NextResponse.json(
                        { error: 'Missing required fields' },
                        { status: 400 }
                    );
                }

                // Update escrow status
                const escrow = await prisma.escrow.update({
                    where: { id: escrowId },
                    data: {
                        status: 'released',
                        releasedAt: new Date(),
                    },
                });

                // Create payout transaction
                const transaction = await prisma.transaction.create({
                    data: {
                        userId: sellerId,
                        type: 'ESCROW_RELEASE',
                        status: 'COMPLETED',
                        amount,
                        currency: escrow.currency,
                        description: `Escrow release for order ${escrow.orderId}`,
                        relatedId: escrowId,
                        relatedType: 'escrow',
                        completedAt: new Date(),
                    },
                });

                // Credit seller wallet
                const wallet = await prisma.wallet.findUnique({
                    where: { userId: sellerId },
                });

                if (wallet) {
                    const newBalance = wallet.balance + amount;
                    await prisma.wallet.update({
                        where: { userId: sellerId },
                        data: {
                            balance: newBalance,
                            totalEarned: wallet.totalEarned + amount,
                        },
                    });
                }

                // Create notification
                await prisma.notification.create({
                    data: {
                        userId: sellerId,
                        type: 'payment',
                        title: 'Escrow Released',
                        message: `Escrow of ${escrow.currency} ${amount} has been released to your wallet.`,
                        relatedId: escrowId,
                    },
                });

                console.log(`💰 Escrow ${escrowId} released to user ${sellerId}`);
                return NextResponse.json({ success: true });
            }

            case 'escrow.disputed': {
                const { escrowId, reason } = data;

                if (!escrowId) {
                    return NextResponse.json(
                        { error: 'Missing escrowId' },
                        { status: 400 }
                    );
                }

                // Update escrow status
                await prisma.escrow.update({
                    where: { id: escrowId },
                    data: {
                        status: 'disputed',
                    },
                });

                // Create notification for admin
                const admins = await prisma.user.findMany({
                    where: { roles: { has: 'ADMIN' } },
                });

                for (const admin of admins) {
                    await prisma.notification.create({
                        data: {
                            userId: admin.id,
                            type: 'payment',
                            title: 'Escrow Dispute',
                            message: `Escrow ${escrowId} has been disputed: ${reason || 'No reason provided'}`,
                            relatedId: escrowId,
                        },
                    });
                }

                console.log(`⚠️ Escrow ${escrowId} disputed`);
                return NextResponse.json({ success: true });
            }

            default:
                console.log(`Unknown webhook type: ${type}`);
                return NextResponse.json({ success: true }); // Always return 200 to acknowledge
        }
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
