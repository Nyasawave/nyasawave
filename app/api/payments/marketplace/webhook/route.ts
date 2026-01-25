import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import fs from "fs/promises";
import path from "path";

/**
 * MARKETPLACE PAYMENT WEBHOOK HANDLER
 * Handles Stripe webhook events for marketplace orders
 * 
 * Events:
 * - charge.succeeded - Payment successful, update order status
 * - charge.failed - Payment failed, refund and cancel order
 * - charge.dispute.created - Dispute filed, create refund
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

const ORDERS_PATH = path.join(process.cwd(), "data", "marketplace-orders.json");
const ESCROW_PATH = path.join(process.cwd(), "data", "marketplace-escrow.json");

interface WebhookPayload {
    type: string;
    data: {
        object: {
            id: string;
            metadata?: Record<string, string>;
            status?: string;
            amount?: number;
        };
    };
}

// Helper functions
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function getOrdersDB(): Promise<any[]> {
    try {
        if (await fileExists(ORDERS_PATH)) {
            const content = await fs.readFile(ORDERS_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function saveOrdersDB(orders: any[]) {
    try {
        const dir = path.dirname(ORDERS_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

async function getEscrowDB(): Promise<any[]> {
    try {
        if (await fileExists(ESCROW_PATH)) {
            const content = await fs.readFile(ESCROW_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function saveEscrowDB(escrows: any[]) {
    try {
        const dir = path.dirname(ESCROW_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(ESCROW_PATH, JSON.stringify(escrows, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * POST /api/payments/marketplace/webhook
 * Stripe webhook endpoint for marketplace orders
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Get webhook signature from header
        const sig = req.headers.get("stripe-signature") || "";
        if (!sig) {
            console.warn("[WEBHOOK] Missing signature");
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        // 2. Read raw body
        const body = await req.text();

        // 3. Verify webhook signature
        let event;
        try {
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        } catch (err) {
            console.error("[WEBHOOK] Signature verification failed:", err);
            return NextResponse.json(
                { error: "Webhook signature verification failed" },
                { status: 401 }
            );
        }

        console.log("[WEBHOOK] Event received:", event.type);

        // 4. Handle event
        switch (event.type) {
            case "charge.succeeded":
                await handleChargeSucceeded(event.data.object);
                break;

            case "charge.failed":
                await handleChargeFailed(event.data.object);
                break;

            case "charge.dispute.created":
                await handleDisputeCreated(event.data.object);
                break;

            default:
                console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("[WEBHOOK] Error:", error);
        return NextResponse.json(
            { error: "Webhook processing error" },
            { status: 500 }
        );
    }
}

/**
 * Handle successful charge
 */
async function handleChargeSucceeded(chargeObject: any) {
    try {
        const { id: chargeId, metadata, amount } = chargeObject;

        if (!metadata?.orderId) {
            console.warn("[WEBHOOK] Missing orderId in metadata");
            return;
        }

        const orderId = metadata.orderId;

        // 1. Get order
        const orders = await getOrdersDB();
        const order = orders.find((o: any) => o.id === orderId);

        if (!order) {
            console.warn(`[WEBHOOK] Order not found: ${orderId}`);
            return;
        }

        // 2. Update order
        order.paymentId = chargeId;
        order.status = "processing";
        order.updatedAt = new Date().toISOString();
        await saveOrdersDB(orders);

        console.log("[WEBHOOK] Payment successful:", {
            orderId,
            chargeId,
            amount,
            sellerId: order.sellerId,
        });
    } catch (error) {
        console.error("[WEBHOOK] handleChargeSucceeded error:", error);
    }
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(chargeObject: any) {
    try {
        const { id: chargeId, metadata } = chargeObject;

        if (!metadata?.orderId) {
            console.warn("[WEBHOOK] Missing orderId in metadata");
            return;
        }

        const orderId = metadata.orderId;

        // 1. Get order
        const orders = await getOrdersDB();
        const order = orders.find((o: any) => o.id === orderId);

        if (!order) {
            console.warn(`[WEBHOOK] Order not found: ${orderId}`);
            return;
        }

        // 2. Update order to failed
        order.status = "refunded";
        order.updatedAt = new Date().toISOString();
        await saveOrdersDB(orders);

        // 3. Release escrow back to buyer
        const escrows = await getEscrowDB();
        const escrow = escrows.find((e: any) => e.orderId === orderId);

        if (escrow) {
            escrow.status = "refunded";
            escrow.refundedAt = new Date().toISOString();
            escrow.refundReason = "Payment failed";
            await saveEscrowDB(escrows);
        }

        console.log("[WEBHOOK] Payment failed:", {
            orderId,
            chargeId,
            buyerId: order.buyerId,
        });
    } catch (error) {
        console.error("[WEBHOOK] handleChargeFailed error:", error);
    }
}

/**
 * Handle dispute created
 */
async function handleDisputeCreated(disputeObject: any) {
    try {
        const { charge: chargeId } = disputeObject;

        // 1. Find order by charge ID
        const orders = await getOrdersDB();
        const order = orders.find((o: any) => o.paymentId === chargeId);

        if (!order) {
            console.warn(`[WEBHOOK] Order not found for charge: ${chargeId}`);
            return;
        }

        // 2. Update order to disputed
        order.status = "disputed";
        order.updatedAt = new Date().toISOString();
        await saveOrdersDB(orders);

        // 3. Hold escrow (no release)
        const escrows = await getEscrowDB();
        const escrow = escrows.find((e: any) => e.orderId === order.id);

        if (escrow) {
            escrow.status = "held"; // Keep held during dispute
            await saveEscrowDB(escrows);
        }

        console.log("[WEBHOOK] Dispute created:", {
            orderId: order.id,
            chargeId,
        });
    } catch (error) {
        console.error("[WEBHOOK] handleDisputeCreated error:", error);
    }
}
