import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

const ORDERS_PATH = path.join(process.cwd(), "data", "marketplace-orders.json");
const ESCROW_PATH = path.join(process.cwd(), "data", "marketplace-escrow.json");

/**
 * MARKETPLACE ORDERS & ESCROW ENDPOINTS
 * 
 * POST /api/marketplace/orders - Create order (LISTENER, with Stripe checkout)
 * GET /api/marketplace/orders - Get user's orders
 * GET /api/marketplace/orders/{id} - Get order details
 * POST /api/marketplace/orders/{id}/confirm - Confirm receipt (BUYER)
 * POST /api/marketplace/orders/{id}/dispute - Create dispute (BUYER/SELLER)
 */

interface Order {
    id: string;
    buyerId: string;
    buyerName: string;
    sellerId: string;
    sellerName: string;
    productId: string;
    productTitle: string;
    price: number;
    currency: string;
    status: "pending_payment" | "processing" | "completed" | "disputed" | "refunded";
    paymentId?: string; // Stripe or Flutterwave reference
    stripeCheckoutId?: string;
    confirmedAt?: string;
    confirmedBy?: string; // "buyer" | "auto"
    dispute?: {
        id: string;
        reason: string;
        resolution: string;
        resolvedAt?: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface Escrow {
    id: string;
    orderId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    currency: string;
    status: "held" | "released" | "refunded";
    releasedAt?: string;
    refundedAt?: string;
    refundReason?: string;
    createdAt: string;
    updatedAt: string;
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

async function getOrdersDB(): Promise<Order[]> {
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

async function saveOrdersDB(orders: Order[]) {
    try {
        const dir = path.dirname(ORDERS_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

async function getEscrowDB(): Promise<Escrow[]> {
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

async function saveEscrowDB(escrows: Escrow[]) {
    try {
        const dir = path.dirname(ESCROW_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(ESCROW_PATH, JSON.stringify(escrows, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

async function getUsersDB() {
    try {
        const usersPath = path.join(process.cwd(), "data", "users.json");
        if (await fileExists(usersPath)) {
            const content = await fs.readFile(usersPath, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function getProductsDB() {
    try {
        const productsPath = path.join(process.cwd(), "data", "marketplace-products.json");
        if (await fileExists(productsPath)) {
            const content = await fs.readFile(productsPath, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

/**
 * POST /api/marketplace/orders
 * Create order
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get request body
        const { productId, paymentMethod = "stripe" } = await req.json();

        if (!productId) {
            return NextResponse.json(
                { error: "productId is required" },
                { status: 400 }
            );
        }

        // 3. Get product
        const products = await getProductsDB();
        const product = products.find((p: any) => p.id === productId);

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // 4. Get buyer user
        const users = await getUsersDB();
        const buyer = users.find((u: any) => u.id === session.user.id);
        const seller = users.find((u: any) => u.id === product.sellerId);

        if (!buyer || !seller) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // 5. Prevent self-purchase
        if (buyer.id === seller.id) {
            return NextResponse.json(
                { error: "You cannot buy your own products" },
                { status: 400 }
            );
        }

        // 6. Create order
        const order: Order = {
            id: `order_${Date.now()}`,
            buyerId: buyer.id,
            buyerName: buyer.name,
            sellerId: seller.id,
            sellerName: seller.name,
            productId,
            productTitle: product.title,
            price: product.price,
            currency: product.currency,
            status: "pending_payment",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // 7. Create escrow hold (funds not actually held until payment confirmed)
        const escrow: Escrow = {
            id: `escrow_${Date.now()}`,
            orderId: order.id,
            buyerId: buyer.id,
            sellerId: seller.id,
            amount: product.price,
            currency: product.currency,
            status: "held",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // 8. Save order and escrow
        const orders = await getOrdersDB();
        orders.push(order);
        const saved = await saveOrdersDB(orders);

        const escrows = await getEscrowDB();
        escrows.push(escrow);
        const escrowSaved = await saveEscrowDB(escrows);

        if (!saved || !escrowSaved) {
            return NextResponse.json(
                { error: "Failed to create order" },
                { status: 500 }
            );
        }

        console.log("[MARKETPLACE] Order created:", {
            orderId: order.id,
            buyerId: buyer.id,
            sellerId: seller.id,
            amount: product.price,
        });

        // 9. Return checkout URL (client will redirect to Stripe/Flutterwave)
        return NextResponse.json(
            {
                success: true,
                order,
                escrow,
                checkout: {
                    type: paymentMethod,
                    orderId: order.id,
                    amount: product.price,
                    currency: product.currency,
                    description: `Purchase: ${product.title}`,
                    // Client should use these to create Stripe/Flutterwave sessions
                    redirectUrl: `${process.env.NEXTAUTH_URL}/marketplace/checkout?orderId=${order.id}`,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[MARKETPLACE] POST order error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/marketplace/orders
 * Get user's orders
 */
export async function GET(req: NextRequest) {
    try {
        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get parameters
        const url = new URL(req.url);
        const role = url.searchParams.get("role") || "buyer"; // "buyer" | "seller"
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");

        // 3. Get orders
        let orders = await getOrdersDB();

        // 4. Filter by role
        if (role === "buyer") {
            orders = orders.filter(o => o.buyerId === session.user.id);
        } else if (role === "seller") {
            orders = orders.filter(o => o.sellerId === session.user.id);
        }

        // 5. Sort by newest first
        orders.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // 6. Paginate
        const total = orders.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginated = orders.slice(offset, offset + limit);

        return NextResponse.json({
            success: true,
            orders: paginated,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error("[MARKETPLACE] GET orders error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
