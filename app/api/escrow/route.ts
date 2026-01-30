import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

/**
 * GET /api/escrow - List all escrows (admin) or user's escrows
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let escrows;
        if (user.roles?.includes('ADMIN')) {
            // Admins see all escrows
            escrows = await prisma.escrow.findMany({
                orderBy: { createdAt: 'desc' },
            });
        } else {
            // Users see their own escrows (as buyer or seller)
            escrows = await prisma.escrow.findMany({
                where: {
                    OR: [{ buyerId: user.id }, { sellerId: user.id }],
                },
                orderBy: { createdAt: 'desc' },
            });
        }

        return NextResponse.json({ escrows });
    } catch (error) {
        console.error('Error fetching escrows:', error);
        return NextResponse.json(
            { error: 'Failed to fetch escrows' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/escrow - Create a new escrow (on order creation)
 * Body: { orderId, buyerId, sellerId, amount, currency }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { orderId, buyerId, sellerId, amount, currency = 'MWK' } = body;

        if (!orderId || !buyerId || !sellerId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (amount <= 0) {
            return NextResponse.json(
                { error: 'Amount must be positive' },
                { status: 400 }
            );
        }

        // Verify user is buyer or admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { wallet: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (
            user.id !== buyerId &&
            !user.roles?.includes('ADMIN')
        ) {
            return NextResponse.json(
                { error: 'Only buyer or admin can create escrow' },
                { status: 403 }
            );
        }

        // Check if buyer has sufficient funds
        const buyerWallet = await prisma.wallet.findUnique({
            where: { userId: buyerId },
        });

        if (!buyerWallet || buyerWallet.balance < amount) {
            return NextResponse.json(
                { error: 'Insufficient funds' },
                { status: 400 }
            );
        }

        // Create escrow and deduct from buyer wallet
        const escrow = await prisma.escrow.create({
            data: {
                orderId,
                buyerId,
                sellerId,
                amount,
                currency,
                status: 'held',
            },
        });

        // Deduct from buyer wallet
        await prisma.wallet.update({
            where: { userId: buyerId },
            data: {
                balance: buyerWallet.balance - amount,
                totalSpent: buyerWallet.totalSpent + amount,
            },
        });

        // Create transaction record
        await prisma.transaction.create({
            data: {
                userId: buyerId,
                type: 'ESCROW_HOLD',
                status: 'COMPLETED',
                amount,
                currency,
                description: `Escrow hold for order ${orderId}`,
                relatedId: escrow.id,
                relatedType: 'escrow',
                completedAt: new Date(),
            },
        });

        // Create notifications
        await prisma.notification.create({
            data: {
                userId: buyerId,
                type: 'payment',
                title: 'Escrow Created',
                message: `${currency} ${amount} held in escrow for order ${orderId}`,
                relatedId: escrow.id,
            },
        });

        await prisma.notification.create({
            data: {
                userId: sellerId,
                type: 'payment',
                title: 'Order Escrow Pending',
                message: `${currency} ${amount} in escrow for order ${orderId}. Process the order to release funds.`,
                relatedId: escrow.id,
            },
        });

        return NextResponse.json({
            escrow,
            message: 'Escrow created successfully',
        });
    } catch (error) {
        console.error('Error creating escrow:', error);
        return NextResponse.json(
            { error: 'Failed to create escrow' },
            { status: 500 }
        );
    }
}
