import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * POST /api/payments/intent
 * Create a payment intent for Stripe or mobile money
 * 
 * Body:
 * {
 *   amount: number (in smallest currency unit)
 *   currency: string ("MWK", "USD", etc)
 *   type: "track_boost" | "marketplace" | "subscription" | "tournament"
 *   relatedId: string (optional - track, product, order ID)
 *   paymentMethod: "stripe" | "airtel_money" | "tnm_mpamba" (optional)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      amount,
      currency = 'MWK',
      type,
      relatedId,
      paymentMethod = 'stripe',
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Payment type required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create payment record (pending)
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        type: type.toUpperCase().replace(/_/g, ' '),
        amount,
        currency,
        status: 'PENDING',
        provider: paymentMethod,
      },
    });

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'DEPOSIT',
        status: 'PENDING',
        amount,
        currency,
        description: `Payment for ${type}`,
        relatedId: relatedId || payment.id,
        relatedType: type,
        paymentMethod,
      },
    });

    // For demo: If using local payment, mark as completed
    if (paymentMethod === 'local' || process.env.NODE_ENV === 'development') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      });

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      // Credit wallet
      const newBalance = (user.wallet?.balance || 0) + amount;
      await prisma.wallet.update({
        where: { userId: user.id },
        data: {
          balance: newBalance,
          totalEarned: (user.wallet?.totalEarned || 0) + amount,
        },
      });

      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          status: 'COMPLETED',
          amount,
          currency,
          type,
          transactionId: transaction.id,
        },
        message: 'Payment completed (demo mode)',
      });
    }

    // For Stripe: Create a payment intent
    if (paymentMethod === 'stripe') {
      // TODO: Integrate with Stripe API
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // const intent = await stripe.paymentIntents.create({...});

      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          clientSecret: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // TODO: Use real Stripe client secret
          status: 'PENDING',
          amount,
          currency,
          type,
        },
        message: 'Payment intent created. Use clientSecret to confirm payment.',
      });
    }

    // For mobile money: Create transaction request
    if (['airtel_money', 'tnm_mpamba'].includes(paymentMethod)) {
      // TODO: Integrate with mobile money API
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          status: 'PENDING',
          amount,
          currency,
          type,
          paymentUrl: `https://payment-gateway.example.com/pay/${payment.id}`,
        },
        message: 'Mobile money payment request created. Redirect user to paymentUrl.',
      });
    }

    return NextResponse.json(
      { error: 'Unsupported payment method' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
