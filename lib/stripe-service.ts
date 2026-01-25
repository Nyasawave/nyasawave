/**
 * STRIPE INTEGRATION SERVICE
 * 
 * Handles all Stripe operations:
 * - Customer management
 * - Subscription creation
 * - Payment intents
 * - Webhook events
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2023-10-16" as any,
});

export interface CreateSubscriptionParams {
    userId: string;
    email: string;
    priceId: string;
    name: string;
    metadata?: Record<string, string>;
}

export interface CreatePaymentIntentParams {
    userId: string;
    amount: number; // in cents
    currency: string;
    description: string;
    metadata?: Record<string, string>;
}

/**
 * Get or create Stripe customer
 */
export async function getOrCreateCustomer(
    email: string,
    userId: string,
    name?: string
) {
    try {
        // Search for existing customer
        const customers = await stripe.customers.list({
            email,
            limit: 1,
        });

        if (customers.data.length > 0) {
            return customers.data[0];
        }

        // Create new customer
        const customer = await stripe.customers.create({
            email,
            name: name || undefined,
            metadata: {
                userId,
            },
        });

        return customer;
    } catch (error) {
        console.error("[STRIPE] Error getting/creating customer:", error);
        throw error;
    }
}

/**
 * Create or retrieve subscription
 */
export async function createSubscription(params: CreateSubscriptionParams) {
    try {
        const { userId, email, priceId, name, metadata } = params;

        // Get or create customer
        const customer = await getOrCreateCustomer(email, userId, name);

        // Check if customer already has active subscription
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "active",
            limit: 1,
        });

        if (subscriptions.data.length > 0) {
            console.log("[STRIPE] Customer already has active subscription");
            return {
                success: false,
                error: "Already subscribed",
                subscription: subscriptions.data[0],
            };
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: "default_incomplete",
            expand: ["latest_invoice.payment_intent"],
            metadata: {
                userId,
                ...metadata,
            },
        });

        return {
            success: true,
            subscription,
        };
    } catch (error) {
        console.error("[STRIPE] Error creating subscription:", error);
        throw error;
    }
}

/**
 * Create payment intent (for one-time payments like tournament entry, marketplace listing)
 */
export async function createPaymentIntent(params: CreatePaymentIntentParams) {
    try {
        const { userId, amount, currency, description, metadata } = params;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            description,
            metadata: {
                userId,
                ...metadata,
            },
        });

        return paymentIntent;
    } catch (error) {
        console.error("[STRIPE] Error creating payment intent:", error);
        throw error;
    }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
    try {
        const subscription = await stripe.subscriptions.del(subscriptionId);
        return subscription;
    } catch (error) {
        console.error("[STRIPE] Error canceling subscription:", error);
        throw error;
    }
}

/**
 * Get subscription
 */
export async function getSubscription(subscriptionId: string) {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        return subscription;
    } catch (error) {
        console.error("[STRIPE] Error retrieving subscription:", error);
        throw error;
    }
}

/**
 * Get customer subscriptions
 */
export async function getCustomerSubscriptions(customerId: string) {
    try {
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
        });
        return subscriptions.data;
    } catch (error) {
        console.error("[STRIPE] Error retrieving customer subscriptions:", error);
        throw error;
    }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
    body: string,
    signature: string
): Stripe.Event | null {
    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        return event;
    } catch (error) {
        console.error("[STRIPE] Webhook verification failed:", error);
        return null;
    }
}

/**
 * Handle subscription payment succeeded
 */
export async function handleSubscriptionPaymentSucceeded(subscription: Stripe.Subscription) {
    console.log("[STRIPE] Subscription payment succeeded:", {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
    });

    // Update user's premium status in database
    // This will be called from webhook handler
    return {
        subscriptionId: subscription.id,
        status: subscription.status,
    };
}

/**
 * Handle subscription canceled
 */
export async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    console.log("[STRIPE] Subscription canceled:", {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
    });

    // Remove user's premium status in database
    return {
        subscriptionId: subscription.id,
        status: "canceled",
    };
}

/**
 * Handle payment intent succeeded
 */
export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log("[STRIPE] Payment intent succeeded:", {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        metadata: paymentIntent.metadata,
    });

    // Process based on metadata (tournament, marketplace, etc)
    return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
    };
}

/**
 * Get Stripe pricing (for subscription plans)
 */
export async function getPricingPlans() {
    try {
        const prices = await stripe.prices.list({
            active: true,
            expand: ["data.product"],
        });

        return prices.data.map((price) => ({
            id: price.id,
            productId: price.product,
            amount: price.unit_amount || 0,
            currency: price.currency,
            interval: (price as any).recurring?.interval || "one_time",
            intervalCount: (price as any).recurring?.interval_count || 1,
        }));
    } catch (error) {
        console.error("[STRIPE] Error getting pricing plans:", error);
        throw error;
    }
}

export default stripe;
