import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

/**
 * ADMIN STATS ENDPOINT
 * GET /api/admin/stats
 */

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
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

async function getTournamentsDB() {
    try {
        const tournamentsPath = path.join(process.cwd(), "data", "tournaments.json");
        if (await fileExists(tournamentsPath)) {
            const content = await fs.readFile(tournamentsPath, "utf-8");
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

async function getDisputesDB() {
    try {
        const disputesPath = path.join(process.cwd(), "data", "marketplace-disputes.json");
        if (await fileExists(disputesPath)) {
            const content = await fs.readFile(disputesPath, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await getUsersDB();
        const user = users.find((u: any) => u.id === session.user.id);

        if (!user || !user.roles?.includes("ADMIN")) {
            return NextResponse.json(
                { error: "Only admins can access this" },
                { status: 403 }
            );
        }

        const tournaments = await getTournamentsDB();
        const orders = await getOrdersDB();
        const disputes = await getDisputesDB();

        const totalUsers = users.length;
        const totalArtists = users.filter((u: any) =>
            u.roles?.includes("ARTIST")
        ).length;
        const activeTournaments = tournaments.filter(
            (t: any) => t.status === "active"
        ).length;
        const totalRevenue = orders
            .filter((o: any) => o.status === "completed")
            .reduce((sum: number, o: any) => sum + o.price, 0);
        const pendingDisputes = disputes.filter(
            (d: any) => d.status !== "closed"
        ).length;

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                totalArtists,
                totalTournaments: activeTournaments,
                totalRevenue,
                pendingDisputes,
            },
        });
    } catch (error) {
        console.error("[ADMIN] Stats error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
