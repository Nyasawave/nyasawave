/**
 * CHECKOUT ENDPOINT
 * 
 * POST /api/payments/checkout
 * 
 * Creates a Stripe checkout session for subscription plans
 * 
 * Request:
 * {
 *   plan: "monthly" | "annual" | "one-time"
 *   amount?: number (for one-time payments)
 *   type?: "subscription" | "tournament" | "marketplace"
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   sessionId?: string
 *   clientSecret?: string
 *   redirectUrl?: string
 *   error?: string
 * }
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import stripe, { getOrCreateCustomer } from "@/lib/stripe-service";
import { checkAccess } from "@/app/utils/accessControl";

const PRICING_PLANS: Record<
    string,
    {
        name: string;
        amount: number; // in cents
        interval: "month" | "year" | null;
        description: string;
    }
> = {
    monthly: {
        name: "Premium Monthly",
        amount: 999, // $9.99
        interval: "month",
        description: "Unlimited downloads and tournament access",
    },
    annual: {
        name: "Premium Annual",
        amount: 9999, // $99.99
        interval: "year",
        description: "Unlimited downloads and tournament access",
    },
    tournament_entry: {
        name: "Tournament Entry",
        amount: 999, // $9.99
        interval: null,
        description: "Single tournament entry fee",
    },
    marketplace_listing: {
        name: "Marketplace Listing",
        amount: 2999, // $29.99
        interval: null,
        description: "7-day marketplace listing",
    },
};

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { plan, amount, type = "subscription" } = await request.json();

        const user = session.user;
        const email = user.email || "";
        const userId = user.id || "";
        const name = user.name || "";

        // Validate plan
        if (!PRICING_PLANS[plan]) {
            return Response.json(
                { error: "Invalid pricing plan" },
                { status: 400 }
            );
        }

        const pricing = PRICING_PLANS[plan];

        // Check access before creating payment intent
        let accessResult;
        if (type === "tournament") {
            accessResult = checkAccess({
                user: user as any,
                action: "join_tournament",
                isTournament: true,
                resourceType: "tournament",
            });
        } else if (type === "marketplace") {
            accessResult = checkAccess({
                user: user as any,
                action: "list_marketplace",
                resourceType: "marketplace_item",
            });
        }

        // If access denied for specific types, return error
        if (accessResult && !accessResult.allowed && !user.premiumListener) {
            return Response.json(
                {
                    error: accessResult.reason,
                    suggestedAction: accessResult.suggestedAction,
                },
                { status: 403 }
            );
        }

        try {
            // Get or create Stripe customer
            const customer = await getOrCreateCustomer(email, userId, name);

            // Create checkout session
            const checkoutSession = await stripe.checkout.sessions.create({
                customer: customer.id,
                payment_method_types: ["card"],
                mode: type === "subscription" ? "subscription" : "payment",
                success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
                metadata: {
                    userId,
                    type,
                    plan,
                },
                ...(type === "subscription"
                    ? {
                        line_items: [
                            {
                                price_data: {
                                    currency: "usd",
                                    product_data: {
                                        name: pricing.name,
                                        description: pricing.description,
                                    },
                                    unit_amount: pricing.amount,
                                    recurring: pricing.interval
                                        ? { interval: pricing.interval }
                                        : undefined,
                                },
                                quantity: 1,
                            },
                        ],
                    }
                    : {
                        line_items: [
                            {
                                price_data: {
                                    currency: "usd",
                                    product_data: {
                                        name: pricing.name,
                                        description: pricing.description,
                                    },
                                    unit_amount: pricing.amount,
                                },
                                quantity: 1,
                            },
                        ],
                    }),
            });

            console.log("[CHECKOUT] Session created:", {
                sessionId: checkoutSession.id,
                userId,
                plan,
                type,
            });

            return Response.json({
                success: true,
                sessionId: checkoutSession.id,
                redirectUrl: checkoutSession.url,
            });
        } catch (stripeError) {
            console.error("[CHECKOUT] Stripe error:", stripeError);

            return Response.json(
                {
                    error: "Failed to create checkout session",
                    details:
                        stripeError instanceof Error
                            ? stripeError.message
                            : "Unknown error",
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("[CHECKOUT] Error:", error);

        return Response.json(
            {
                error: "Internal server error",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        // Return available pricing plans
        return Response.json({
            plans: PRICING_PLANS,
        });
    } catch (error) {
        console.error("[CHECKOUT] Error fetching plans:", error);
        return Response.json(
            { error: "Failed to fetch plans" },
            { status: 500 }
        );
    }
}
