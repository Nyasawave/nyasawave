import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "tournaments.json");

/**
 * TOURNAMENT ENDPOINTS
 * 
 * GET /api/tournaments - List all tournaments
 * POST /api/tournaments - Create tournament (ADMIN only)
 * GET /api/tournaments/{id} - Get tournament details
 * POST /api/tournaments/{id}/join - Join tournament (ARTIST only, requires payment)
 */

interface Tournament {
    id: string;
    creatorId: string;
    title: string;
    description?: string;
    rules?: string;
    status: "draft" | "active" | "closed" | "completed";
    genre?: string;
    region?: string;
    startDate: string;
    endDate: string;
    submissionDeadline: string;
    prizePool: number;
    currency: string;
    maxParticipants?: number;
    entryFee: number;
    rankingBy: string; // "plays,likes,downloads"
    participants: string[]; // Artist IDs
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

// Helper: Read tournaments DB
async function getTournamentsDB(): Promise<Tournament[]> {
    try {
        if (await fileExists(DB_PATH)) {
            const content = await fs.readFile(DB_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        console.error("[TOURNAMENTS] Error reading DB:", e);
        return [];
    }
}

// Helper: Save tournaments DB
async function saveTournamentsDB(tournaments: Tournament[]) {
    try {
        const dir = path.dirname(DB_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(DB_PATH, JSON.stringify(tournaments, null, 2));
        return true;
    } catch (e) {
        console.error("[TOURNAMENTS] Error saving DB:", e);
        return false;
    }
}

// Helper: Check file exists
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Helper: Read users DB to get user info
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
 * GET /api/tournaments
 * List all tournaments (paginated)
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const tournaments = await getTournamentsDB();

        // Filter by status if provided
        let filtered = tournaments;
        if (status && ["draft", "active", "closed", "completed"].includes(status)) {
            filtered = tournaments.filter(t => t.status === status);
        }

        // Pagination
        const total = filtered.length;
        const start = (page - 1) * limit;
        const paginatedTournaments = filtered.slice(start, start + limit);

        return NextResponse.json({
            success: true,
            total,
            page,
            limit,
            tournaments: paginatedTournaments,
        });
    } catch (error) {
        console.error("[TOURNAMENTS] GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/tournaments
 * Create new tournament (ADMIN only)
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Check session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Check if admin
        const users = await getUsersDB();
        const user = users.find((u: any) => u.id === session.user.id);
        if (!user || !user.roles?.includes("ADMIN")) {
            return NextResponse.json(
                { error: "Only admins can create tournaments" },
                { status: 403 }
            );
        }

        // 3. Parse request body
        const body = await req.json();
        const {
            title,
            description,
            rules,
            genre,
            region,
            startDate,
            endDate,
            submissionDeadline,
            prizePool,
            currency,
            maxParticipants,
            entryFee,
            rankingBy,
        } = body;

        // 4. Validate inputs
        if (!title || title.trim().length === 0) {
            return NextResponse.json(
                { error: "Tournament title is required" },
                { status: 400 }
            );
        }

        if (!startDate || !endDate || !submissionDeadline) {
            return NextResponse.json(
                { error: "Start date, end date, and submission deadline are required" },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const deadline = new Date(submissionDeadline);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(deadline.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            );
        }

        if (deadline >= end) {
            return NextResponse.json(
                { error: "Submission deadline must be before tournament end date" },
                { status: 400 }
            );
        }

        if (start >= end) {
            return NextResponse.json(
                { error: "Start date must be before end date" },
                { status: 400 }
            );
        }

        // 5. Create tournament
        const now = new Date().toISOString();
        const tournament: Tournament = {
            id: `tournament_${Date.now()}`,
            creatorId: session.user.id,
            title: title.trim(),
            description: description?.trim(),
            rules: rules?.trim(),
            status: "draft",
            genre,
            region,
            startDate,
            endDate,
            submissionDeadline,
            prizePool: parseFloat(prizePool) || 0,
            currency: currency || "MWK",
            maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
            entryFee: parseFloat(entryFee) || 0,
            rankingBy: rankingBy || "plays,likes,downloads",
            participants: [],
            createdAt: now,
            updatedAt: now,
        };

        // 6. Save to database
        const tournaments = await getTournamentsDB();
        tournaments.push(tournament);
        const saved = await saveTournamentsDB(tournaments);

        if (!saved) {
            return NextResponse.json(
                { error: "Failed to save tournament" },
                { status: 500 }
            );
        }

        console.log("[TOURNAMENTS] Created:", {
            id: tournament.id,
            title: tournament.title,
            creator: user.email,
        });

        return NextResponse.json(
            {
                success: true,
                tournament,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[TOURNAMENTS] POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

