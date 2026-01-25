import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import fs from "fs/promises";
import path from "path";

/**
 * ARTIST PAYOUT ENDPOINTS
 * 
 * GET /api/payments/payouts/balance - Get artist earnings
 * POST /api/payments/payouts/request - Request payout
 * GET /api/payments/payouts/history - Get payout history
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const PAYOUTS_PATH = path.join(process.cwd(), "data", "artist-payouts.json");
const ESCROW_PATH = path.join(process.cwd(), "data", "marketplace-escrow.json");

interface Payout {
    id: string;
    artistId: string;
    amount: number;
    currency: string;
    status: "requested" | "processing" | "completed" | "failed";
    stripePayoutId?: string;
    bankAccount?: {
        last4: string;
        bank_name: string;
    };
    requestedAt: string;
    processedAt?: string;
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

async function getPayoutsDB(): Promise<Payout[]> {
    try {
        if (await fileExists(PAYOUTS_PATH)) {
            const content = await fs.readFile(PAYOUTS_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function savePayoutsDB(payouts: Payout[]) {
    try {
        const dir = path.dirname(PAYOUTS_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(PAYOUTS_PATH, JSON.stringify(payouts, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

async function getEscrowDB() {
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

async function getOrdersDB() {
    try {
        const ordersPath = path.join(process.cwd(), "data", "marketplace-orders.json");
        if (await fileExists(ordersPath)) {
            const content = await fs.readFile(ordersPath, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

/**
 * GET /api/payments/payouts/balance
 * Get artist balance and earnings
 */
export async function GET(req: NextRequest) {
    try {
        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Check if artist
        const users = await getUsersDB();
        const user = users.find((u: any) => u.id === session.user.id);

        const isArtist = user?.roles?.includes("ARTIST");
        const isEntrepreneur = user?.roles?.includes("ENTREPRENEUR");

        if (!isArtist && !isEntrepreneur) {
            return NextResponse.json(
                { error: "Only artists and entrepreneurs can request payouts" },
                { status: 403 }
            );
        }

        // 3. Get URL params
        const url = new URL(req.url);
        const action = url.pathname.split("/").pop();

        if (action === "balance") {
            return handleGetBalance(session.user.id);
        } else if (action === "history") {
            return handleGetPayoutHistory(session.user.id);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("[PAYOUTS] GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Get artist balance
 */
async function handleGetBalance(artistId: string) {
    try {
        // 1. Get all released escrows for this seller
        const escrows = await getEscrowDB();
        const releaseEscrows = escrows.filter(
            (e: any) =>
                e.sellerId === artistId &&
                e.status === "released"
        );

        // 2. Calculate released balance
        const releasedBalance = releaseEscrows.reduce(
            (sum: number, e: any) => sum + e.amount,
            0
        );

        // 3. Get pending (held) escrows
        const heldEscrows = escrows.filter(
            (e: any) =>
                e.sellerId === artistId &&
                e.status === "held"
        );

        const pendingBalance = heldEscrows.reduce(
            (sum: number, e: any) => sum + e.amount,
            0
        );

        // 4. Get payout history
        const payouts = await getPayoutsDB();
        const artistPayouts = payouts.filter((p: any) => p.artistId === artistId);

        const totalPaidOut = artistPayouts
            .filter((p: any) => p.status === "completed")
            .reduce((sum: number, p: any) => sum + p.amount, 0);

        // 5. Available for payout (released - paid out)
        const availableForPayout = releasedBalance - totalPaidOut;

        return NextResponse.json({
            success: true,
            balance: {
                released: releasedBalance,
                pending: pendingBalance,
                paidOut: totalPaidOut,
                availableForPayout: Math.max(0, availableForPayout),
            },
            currency: "USD",
        });
    } catch (error) {
        console.error("[PAYOUTS] Balance error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Get payout history
 */
async function handleGetPayoutHistory(artistId: string) {
    try {
        const payouts = await getPayoutsDB();
        const artistPayouts = payouts
            .filter((p: any) => p.artistId === artistId)
            .sort(
                (a, b) =>
                    new Date(b.requestedAt).getTime() -
                    new Date(a.requestedAt).getTime()
            );

        return NextResponse.json({
            success: true,
            payouts: artistPayouts,
        });
    } catch (error) {
        console.error("[PAYOUTS] History error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/payments/payouts/request
 * Request payout
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Check if artist/entrepreneur
        const users = await getUsersDB();
        const user = users.find((u: any) => u.id === session.user.id);

        const isArtist = user?.roles?.includes("ARTIST");
        const isEntrepreneur = user?.roles?.includes("ENTREPRENEUR");

        if (!isArtist && !isEntrepreneur) {
            return NextResponse.json(
                { error: "Only artists and entrepreneurs can request payouts" },
                { status: 403 }
            );
        }

        // 3. Get request data
        const { amount, bankAccount } = await req.json();

        if (!amount || !bankAccount) {
            return NextResponse.json(
                { error: "amount and bankAccount are required" },
                { status: 400 }
            );
        }

        // 4. Get available balance
        const escrows = await getEscrowDB();
        const releaseEscrows = escrows.filter(
            (e: any) =>
                e.sellerId === session.user.id &&
                e.status === "released"
        );

        const releasedBalance = releaseEscrows.reduce(
            (sum: number, e: any) => sum + e.amount,
            0
        );

        const payouts = await getPayoutsDB();
        const artistPayouts = payouts.filter(
            (p: any) =>
                p.artistId === session.user.id &&
                p.status === "completed"
        );

        const totalPaidOut = artistPayouts.reduce(
            (sum: number, p: any) => sum + p.amount,
            0
        );

        const availableForPayout = releasedBalance - totalPaidOut;

        // 5. Validate requested amount
        if (amount > availableForPayout) {
            return NextResponse.json(
                {
                    error: `Insufficient balance. Available: ${availableForPayout}`,
                },
                { status: 400 }
            );
        }

        // 6. Minimum payout threshold ($10)
        if (amount < 10) {
            return NextResponse.json(
                { error: "Minimum payout amount is $10" },
                { status: 400 }
            );
        }

        // 7. Create payout record
        const payout: Payout = {
            id: `payout_${Date.now()}`,
            artistId: session.user.id,
            amount,
            currency: "USD",
            status: "requested",
            bankAccount: {
                last4: bankAccount.accountNumber?.slice(-4) || "****",
                bank_name: bankAccount.bankName || "Unknown Bank",
            },
            requestedAt: new Date().toISOString(),
        };

        payouts.push(payout);
        await savePayoutsDB(payouts);

        console.log("[PAYOUTS] Payout requested:", {
            payoutId: payout.id,
            artistId: session.user.id,
            amount,
        });

        // 8. TODO: Integrate with Stripe Connect for actual payout
        // await stripe.payouts.create({
        //   amount: Math.round(amount * 100), // Convert to cents
        //   currency: 'usd',
        //   destination: stripeAccountId,
        // });

        return NextResponse.json(
            {
                success: true,
                payout,
                message:
                    "Payout requested. Processing typically takes 1-2 business days.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[PAYOUTS] Request error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
