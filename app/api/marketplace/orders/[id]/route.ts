import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

const ORDERS_PATH = path.join(process.cwd(), "data", "marketplace-orders.json");
const ESCROW_PATH = path.join(process.cwd(), "data", "marketplace-escrow.json");
const DISPUTES_PATH = path.join(process.cwd(), "data", "marketplace-disputes.json");

/**
 * ORDER DETAIL & DISPUTE ENDPOINTS
 * 
 * GET /api/marketplace/orders/{id} - Get order details
 * POST /api/marketplace/orders/{id}/confirm - Confirm receipt
 * POST /api/marketplace/orders/{id}/dispute - Create dispute
 */

interface Dispute {
    id: string;
    orderId: string;
    initiatedBy: string; // buyerId | sellerId
    initiatedByName: string;
    reason: string;
    description: string;
    status: "open" | "under_review" | "resolved" | "closed";
    resolution?: string;
    winner?: "buyer" | "seller";
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
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

async function getDisputesDB(): Promise<Dispute[]> {
    try {
        if (await fileExists(DISPUTES_PATH)) {
            const content = await fs.readFile(DISPUTES_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function saveDisputesDB(disputes: Dispute[]) {
    try {
        const dir = path.dirname(DISPUTES_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(DISPUTES_PATH, JSON.stringify(disputes, null, 2));
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

/**
 * GET /api/marketplace/orders/{id}
 * Get order details
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get order
        const orders = await getOrdersDB();
        const order = orders.find((o: any) => o.id === id);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // 3. Check access (buyer or seller only)
        const canAccess =
            session.user.id === order.buyerId ||
            session.user.id === order.sellerId;

        if (!canAccess) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // 4. Get related escrow
        const escrows = await getEscrowDB();
        const escrow = escrows.find((e: any) => e.orderId === order.id);

        // 5. Get dispute if exists
        const disputes = await getDisputesDB();
        const dispute = disputes.find((d: any) => d.orderId === order.id);

        return NextResponse.json({
            success: true,
            order,
            escrow,
            dispute,
        });
    } catch (error) {
        console.error("[MARKETPLACE] GET order error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/marketplace/orders/{id}/confirm
 * Confirm receipt (buyer confirms they received digital product)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const url = new URL(req.url);
        const action = url.pathname.split("/").pop();

        if (action === "confirm") {
            return handleConfirmOrder(req, id);
        } else if (action === "dispute") {
            return handleCreateDispute(req, id);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("[MARKETPLACE] POST action error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Handle confirming order receipt
 */
async function handleConfirmOrder(req: NextRequest, orderId: string) {
    try {
        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get order
        const orders = await getOrdersDB();
        const order = orders.find((o: any) => o.id === orderId);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // 3. Check if buyer
        if (order.buyerId !== session.user.id) {
            return NextResponse.json(
                { error: "Only buyer can confirm" },
                { status: 403 }
            );
        }

        // 4. Check order status (must be processing or completed)
        if (!["processing", "completed"].includes(order.status)) {
            return NextResponse.json(
                { error: "Order must be processing or completed" },
                { status: 400 }
            );
        }

        // 5. Mark as confirmed
        order.status = "completed";
        order.confirmedAt = new Date().toISOString();
        order.confirmedBy = "buyer";
        order.updatedAt = new Date().toISOString();

        // 6. Release escrow to seller
        const escrows = await getEscrowDB();
        const escrow = escrows.find((e: any) => e.orderId === orderId);

        if (escrow && escrow.status === "held") {
            escrow.status = "released";
            escrow.releasedAt = new Date().toISOString();
            escrow.updatedAt = new Date().toISOString();
            await saveEscrowDB(escrows);

            console.log("[MARKETPLACE] Escrow released:", {
                escrowId: escrow.id,
                orderId,
                sellerId: order.sellerId,
                amount: escrow.amount,
            });
        }

        // 7. Save order
        await saveOrdersDB(orders);

        return NextResponse.json({
            success: true,
            order,
            escrow,
            message: "Order confirmed. Seller will receive payment.",
        });
    } catch (error) {
        console.error("[MARKETPLACE] Confirm error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Handle creating dispute
 */
async function handleCreateDispute(req: NextRequest, orderId: string) {
    try {
        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get order
        const orders = await getOrdersDB();
        const order = orders.find((o: any) => o.id === orderId);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // 3. Check if buyer or seller
        const isBuyer = order.buyerId === session.user.id;
        const isSeller = order.sellerId === session.user.id;

        if (!isBuyer && !isSeller) {
            return NextResponse.json(
                { error: "Only buyer or seller can create dispute" },
                { status: 403 }
            );
        }

        // 4. Get dispute data
        const { reason, description } = await req.json();

        if (!reason || !description) {
            return NextResponse.json(
                { error: "reason and description are required" },
                { status: 400 }
            );
        }

        // 5. Check if dispute already exists
        const disputes = await getDisputesDB();
        const existing = disputes.find((d: any) => d.orderId === orderId);

        if (existing && existing.status !== "closed") {
            return NextResponse.json(
                { error: "An open dispute already exists for this order" },
                { status: 400 }
            );
        }

        // 6. Create dispute
        const users = await getUsersDB();
        const user = users.find((u: any) => u.id === session.user.id);

        const dispute: Dispute = {
            id: `dispute_${Date.now()}`,
            orderId,
            initiatedBy: session.user.id,
            initiatedByName: user?.name || "Unknown",
            reason,
            description,
            status: "open",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        disputes.push(dispute);
        await saveDisputesDB(disputes);

        // 7. Update order status
        order.status = "disputed";
        order.updatedAt = new Date().toISOString();
        await saveOrdersDB(orders);

        // 8. Hold escrow (don't release to seller)
        const escrows = await getEscrowDB();
        const escrow = escrows.find((e: any) => e.orderId === orderId);
        if (escrow) {
            escrow.status = "held"; // Keep held during dispute
            await saveEscrowDB(escrows);
        }

        console.log("[MARKETPLACE] Dispute created:", {
            disputeId: dispute.id,
            orderId,
            initiatedBy: session.user.id,
            reason,
        });

        return NextResponse.json(
            {
                success: true,
                dispute,
                message:
                    "Dispute created. NyasaWave support will review within 48 hours.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[MARKETPLACE] Dispute error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
