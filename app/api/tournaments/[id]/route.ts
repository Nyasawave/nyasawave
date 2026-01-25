import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

const TOURNAMENTS_PATH = path.join(process.cwd(), "data", "tournaments.json");
const PARTICIPANTS_PATH = path.join(process.cwd(), "data", "tournament-participants.json");

/**
 * TOURNAMENT PARTICIPANT ENDPOINTS
 * 
 * POST /api/tournaments/{id}/join - Join tournament (ARTIST only)
 * GET /api/tournaments/{id}/participants - Get tournament participants
 * POST /api/tournaments/{id}/submit - Submit song to tournament (ARTIST)
 * GET /api/tournaments/{id}/submissions - Get tournament submissions
 */

interface TournamentParticipant {
    id: string;
    tournamentId: string;
    artistId: string;
    userId: string;
    status: "active" | "disqualified" | "withdrew";
    entryPaid: boolean;
    paymentId?: string;
    currentRank?: number;
    score: number;
    joinedAt: string;
}

interface TournamentSubmission {
    id: string;
    tournamentId: string;
    participantId: string;
    trackId: string;
    status: "submitted" | "accepted" | "rejected";
    rejectionReason?: string;
    playsAtSubmission: number;
    likesAtSubmission: number;
    downloadsAtSubmission: number;
    submittedAt: string;
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

async function getTournamentsDB() {
    try {
        if (await fileExists(TOURNAMENTS_PATH)) {
            const content = await fs.readFile(TOURNAMENTS_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function saveTournamentsDB(tournaments: any[]) {
    try {
        await fs.writeFile(TOURNAMENTS_PATH, JSON.stringify(tournaments, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

async function getParticipantsDB(): Promise<TournamentParticipant[]> {
    try {
        if (await fileExists(PARTICIPANTS_PATH)) {
            const content = await fs.readFile(PARTICIPANTS_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function saveParticipantsDB(participants: TournamentParticipant[]) {
    try {
        const dir = path.dirname(PARTICIPANTS_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(PARTICIPANTS_PATH, JSON.stringify(participants, null, 2));
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
 * POST /api/tournaments/{id}/join
 * Join a tournament (ARTIST only)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; action?: string }> }
) {
    try {
        const { id } = await params;
        const url = new URL(req.url);
        const action = url.pathname.split("/").pop();

        if (action === "join") {
            return handleJoinTournament(req, id);
        } else if (action === "submit") {
            return handleSubmitTrack(req, id);
        } else if (action === "participants") {
            return handleGetParticipants(req, id);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("[TOURNAMENT] POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Handle joining tournament
 */
async function handleJoinTournament(req: NextRequest, tournamentId: string) {
    try {
        // 1. Check session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Check if artist
        const users = await getUsersDB();
        const user = users.find((u: any) => u.id === session.user.id);
        if (!user || !user.roles?.includes("ARTIST")) {
            return NextResponse.json(
                { error: "Only artists can join tournaments" },
                { status: 403 }
            );
        }

        // 3. Get tournament
        const tournaments = await getTournamentsDB();
        const tournament = tournaments.find((t: any) => t.id === tournamentId);
        if (!tournament) {
            return NextResponse.json(
                { error: "Tournament not found" },
                { status: 404 }
            );
        }

        // 4. Check if tournament is active
        if (tournament.status !== "active" && tournament.status !== "draft") {
            return NextResponse.json(
                { error: "Tournament is not open for entries" },
                { status: 400 }
            );
        }

        // 5. Check if already joined
        const participants = await getParticipantsDB();
        const alreadyJoined = participants.find(
            (p: any) =>
                p.tournamentId === tournamentId &&
                p.userId === session.user.id
        );
        if (alreadyJoined) {
            return NextResponse.json(
                { error: "You have already joined this tournament" },
                { status: 400 }
            );
        }

        // 6. Check max participants
        if (tournament.maxParticipants) {
            const tournamentParticipants = participants.filter(
                (p: any) => p.tournamentId === tournamentId && p.status === "active"
            );
            if (tournamentParticipants.length >= tournament.maxParticipants) {
                return NextResponse.json(
                    { error: "Tournament is full" },
                    { status: 400 }
                );
            }
        }

        // 7. Create participant entry
        const now = new Date().toISOString();
        const participant: TournamentParticipant = {
            id: `participant_${Date.now()}`,
            tournamentId,
            artistId: user.artistId || `artist_${Date.now()}`,
            userId: session.user.id,
            status: "active",
            entryPaid: tournament.entryFee === 0, // Auto-mark as paid if no fee
            score: 0,
            joinedAt: now,
        };

        // 8. If tournament has entry fee, mark as pending payment
        if (tournament.entryFee > 0) {
            participant.entryPaid = false;
            // TODO: Integrate with payment system
        }

        // 9. Add participant
        participants.push(participant);
        const saved = await saveParticipantsDB(participants);

        if (!saved) {
            return NextResponse.json(
                { error: "Failed to join tournament" },
                { status: 500 }
            );
        }

        // 10. Add to tournament participants list
        if (!tournament.participants) {
            tournament.participants = [];
        }
        tournament.participants.push(session.user.id);
        await saveTournamentsDB(tournaments);

        console.log("[TOURNAMENT] Artist joined:", {
            tournamentId,
            userId: session.user.id,
            artist: user.email,
        });

        return NextResponse.json(
            {
                success: true,
                participant: {
                    id: participant.id,
                    tournamentId: participant.tournamentId,
                    status: participant.status,
                    joinedAt: participant.joinedAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[TOURNAMENT] Join error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Handle submitting track to tournament
 */
async function handleSubmitTrack(req: NextRequest, tournamentId: string) {
    try {
        // 1. Check session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse request
        const { trackId } = await req.json();
        if (!trackId) {
            return NextResponse.json(
                { error: "trackId is required" },
                { status: 400 }
            );
        }

        // 3. Check if artist is in tournament
        const participants = await getParticipantsDB();
        const participant = participants.find(
            (p: any) =>
                p.tournamentId === tournamentId &&
                p.userId === session.user.id
        );

        if (!participant) {
            return NextResponse.json(
                { error: "You are not in this tournament" },
                { status: 403 }
            );
        }

        // 4. Check tournament submission deadline
        const tournaments = await getTournamentsDB();
        const tournament = tournaments.find((t: any) => t.id === tournamentId);
        if (!tournament) {
            return NextResponse.json(
                { error: "Tournament not found" },
                { status: 404 }
            );
        }

        const deadline = new Date(tournament.submissionDeadline);
        if (new Date() > deadline) {
            return NextResponse.json(
                { error: "Submission deadline has passed" },
                { status: 400 }
            );
        }

        // 5. Create submission
        const now = new Date().toISOString();
        const submission: TournamentSubmission = {
            id: `submission_${Date.now()}`,
            tournamentId,
            participantId: participant.id,
            trackId,
            status: "submitted",
            playsAtSubmission: 0,
            likesAtSubmission: 0,
            downloadsAtSubmission: 0,
            submittedAt: now,
        };

        // 6. Save submission (in future, use Prisma)
        // For now, just return success
        console.log("[TOURNAMENT] Track submitted:", {
            tournamentId,
            trackId,
            participantId: participant.id,
        });

        return NextResponse.json(
            {
                success: true,
                submission,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[TOURNAMENT] Submit error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Handle getting tournament participants
 */
async function handleGetParticipants(req: NextRequest, tournamentId: string) {
    try {
        const participants = await getParticipantsDB();
        const tournamentParticipants = participants.filter(
            (p: any) => p.tournamentId === tournamentId
        );

        return NextResponse.json({
            success: true,
            count: tournamentParticipants.length,
            participants: tournamentParticipants,
        });
    } catch (error) {
        console.error("[TOURNAMENT] Get participants error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/tournaments/{id}/participants
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const url = new URL(req.url);
        const action = url.pathname.split("/").pop();

        if (action === "participants") {
            return handleGetParticipants(req, id);
        }

        // Default: Get tournament details
        const tournaments = await getTournamentsDB();
        const tournament = tournaments.find((t: any) => t.id === id);

        if (!tournament) {
            return NextResponse.json(
                { error: "Tournament not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            tournament,
        });
    } catch (error) {
        console.error("[TOURNAMENT] GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
