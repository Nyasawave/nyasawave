/**
 * PAYMENT VERIFICATION ENDPOINT
 * 
 * GET /api/payments/verify?session_id={session_id}
 * POST /api/payments/verify - For legacy payment verification
 * 
 * Verifies a Stripe checkout session and confirms payment
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import stripe from "@/lib/stripe-service";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

interface User {
    id: string;
    email: string;
    premiumListener: boolean;
    payment: {
        provider: string;
        customerId: string;
        verified: boolean;
    };
    subscriptions: {
        premiumListener: {
            active: boolean;
            plan: string;
            expiresAt: string | null;
            stripeSubscriptionId?: string;
        };
    };
    [key: string]: any;
}

export async function GET(req: NextRequest) {
    try {
        const sessionId = req.nextUrl.searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID required" },
                { status: 400 }
            );
        }

        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Retrieve checkout session from Stripe
        let checkoutSession;
        try {
            checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ["subscription"],
            });
        } catch (error) {
            console.error("[VERIFY] Stripe session retrieval error:", error);
            return NextResponse.json(
                { error: "Invalid session ID" },
                { status: 404 }
            );
        }

        // Check payment status
        if (checkoutSession.payment_status !== "paid") {
            return NextResponse.json(
                { error: "Payment not completed", status: checkoutSession.payment_status },
                { status: 402 }
            );
        }

        const userId = (checkoutSession.metadata?.userId as string) || "";
        const type = (checkoutSession.metadata?.type as string) || "subscription";

        // Verify user ID matches
        if (userId !== session.user.id) {
            console.warn(`[VERIFY] User ID mismatch: ${userId} vs ${session.user.id}`);
            return NextResponse.json(
                { error: "Payment user mismatch" },
                { status: 403 }
            );
        }

        // Update user in database
        if (type === "subscription") {
            const subscriptionId = (checkoutSession.subscription as any)?.id;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days

            const updated = await updateUserPremiumStatus(
                userId,
                true,
                subscriptionId,
                expiresAt
            );

            if (!updated) {
                return NextResponse.json(
                    { error: "Failed to update user" },
                    { status: 500 }
                );
            }
        }

        console.log("[VERIFY] Payment verified:", {
            sessionId,
            userId,
            type,
            paymentStatus: checkoutSession.payment_status,
        });

        return NextResponse.json({
            success: true,
            sessionId,
            paymentStatus: checkoutSession.payment_status,
            type,
            message: "Payment verified successfully",
        });
    } catch (error) {
        console.error("[VERIFY] GET Error:", error);

        return NextResponse.json(
            {
                error: "Verification failed",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { transactionId, provider, status } = await req.json();

        // Validate incoming verification request
        if (!transactionId || !provider) {
            return NextResponse.json(
                { error: 'Missing transaction ID or provider' },
                { status: 400 }
            );
        }

        // Handle legacy payment verification (non-Stripe)
        if (provider === 'STRIPE') {
            // Redirect to Stripe verification
            return GET(req);
        }

        // TODO: Call payment provider's verification API
        // - Airtel Money: Verify transaction status
        // - TNM Mpamba: Check USSD response
        // - PayPal: Verify IPN signature

        let verified = false;
        let providerStatus = 'PENDING';

        switch (provider) {
            case 'AIRTEL_MONEY':
                // TODO: Call Airtel Money API to verify
                // const airtelVerification = await airtelMoneyAPI.verify(transactionId);
                verified = Math.random() > 0.1; // Mock 90% success rate
                break;
            case 'TNM_MPAMBA':
                // TODO: Call TNM Mpamba API to verify
                verified = Math.random() > 0.05; // Mock 95% success rate
                break;
            case 'STRIPE':
                // TODO: Call Stripe API to verify
                // const stripeVerification = await stripe.charges.retrieve(transactionId);
                verified = Math.random() > 0.02; // Mock 98% success rate
                break;
        }

        providerStatus = verified ? 'COMPLETED' : 'FAILED';

        // TODO: Update payment record in database
        // TODO: If verified, trigger artist payout
        // TODO: If failed, send error notification

        return NextResponse.json({
            verified,
            status: providerStatus,
            transactionId,
            provider,
            message: verified
                ? 'Payment verified successfully'
                : 'Payment verification failed',
        });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Verification processing failed' },
            { status: 500 }
        );
    }
}

/**
 * Update user's premium status in users.json
 */
async function updateUserPremiumStatus(
    userId: string,
    isPremium: boolean,
    stripeSubscriptionId?: string,
    expiryDate?: Date
): Promise<boolean> {
    try {
        const data = await readFile(USERS_FILE, "utf-8");
        const users: User[] = JSON.parse(data);

        const userIndex = users.findIndex((u) => u.id === userId);
        if (userIndex === -1) {
            console.warn(`[VERIFY] User not found: ${userId}`);
            return false;
        }

        const user = users[userIndex];

        // Update premium status
        user.premiumListener = isPremium;
        user.subscriptions = user.subscriptions || {};
        user.subscriptions.premiumListener = {
            active: isPremium,
            plan: isPremium ? "premium" : "free",
            expiresAt: expiryDate?.toISOString() || null,
            stripeSubscriptionId,
        };

        if (isPremium && stripeSubscriptionId) {
            user.payment = user.payment || {};
            user.payment.stripeSubscriptionId = stripeSubscriptionId;
            user.payment.verified = true;
        }

        users[userIndex] = user;
        await writeFile(USERS_FILE, JSON.stringify(users, null, 2));

        console.log(`[VERIFY] Updated user ${userId} premium status:`, {
            isPremium,
            expiresAt: expiryDate?.toISOString(),
        });

        return true;
    } catch (error) {
        console.error("[VERIFY] Error updating user premium status:", error);
        return false;
    }
}
