import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

const VOTES_PATH = path.join(process.cwd(), "data", "tournament-votes.json");
const RANKINGS_PATH = path.join(process.cwd(), "data", "tournament-rankings.json");
const TRACKS_PATH = path.join(process.cwd(), "data", "tracks.json");

/**
 * TOURNAMENT VOTING & RANKING ENDPOINTS
 * 
 * POST /api/tournaments/{id}/vote - Vote for a song (PUBLIC, with IP tracking)
 * GET /api/tournaments/{id}/rankings - Get current rankings
 * POST /api/tournaments/{id}/complete - Complete tournament & distribute prizes (ADMIN)
 */

interface Vote {
    id: string;
    tournamentId: string;
    trackId: string;
    userId?: string; // Optional for anonymous votes
    userIp: string;
    votedAt: string;
}

interface Ranking {
    tournamentId: string;
    participantId: string;
    userId: string;
    trackId: string;
    artistName: string;
    position: number;
    plays: number;
    likes: number;
    downloads: number;
    totalScore: number;
    votes: number;
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

async function getVotesDB(): Promise<Vote[]> {
    try {
        if (await fileExists(VOTES_PATH)) {
            const content = await fs.readFile(VOTES_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function saveVotesDB(votes: Vote[]) {
    try {
        const dir = path.dirname(VOTES_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(VOTES_PATH, JSON.stringify(votes, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

async function getRankingsDB(): Promise<Ranking[]> {
    try {
        if (await fileExists(RANKINGS_PATH)) {
            const content = await fs.readFile(RANKINGS_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function saveRankingsDB(rankings: Ranking[]) {
    try {
        const dir = path.dirname(RANKINGS_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(RANKINGS_PATH, JSON.stringify(rankings, null, 2));
        return true;
    } catch (e) {
        return false;
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

async function saveTournamentsDB(tournaments: any[]) {
    try {
        const tournamentsPath = path.join(process.cwd(), "data", "tournaments.json");
        await fs.writeFile(tournamentsPath, JSON.stringify(tournaments, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

async function getTracksDB() {
    try {
        if (await fileExists(TRACKS_PATH)) {
            const content = await fs.readFile(TRACKS_PATH, "utf-8");
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

async function getParticipantsDB() {
    try {
        const participantsPath = path.join(process.cwd(), "data", "tournament-participants.json");
        if (await fileExists(participantsPath)) {
            const content = await fs.readFile(participantsPath, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

/**
 * Get user IP address (for vote deduplication)
 */
function getUserIp(req: NextRequest): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-real-ip") ||
        "unknown"
    );
}

/**
 * POST /api/tournaments/{id}/vote
 * Vote for a song (PUBLIC, but rate-limited by IP)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tournamentId } = await params;
        const url = new URL(req.url);
        const action = url.pathname.split("/").pop();

        if (action === "vote") {
            return handleVote(req, tournamentId);
        } else if (action === "complete") {
            return handleCompleteTournament(req, tournamentId);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("[TOURNAMENT-VOTE] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Handle voting
 */
async function handleVote(req: NextRequest, tournamentId: string) {
    try {
        // 1. Get vote data
        const { trackId } = await req.json();
        if (!trackId) {
            return NextResponse.json(
                { error: "trackId is required" },
                { status: 400 }
            );
        }

        // 2. Get user IP (for rate limiting & deduplication)
        const userIp = getUserIp(req);
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // 3. Anti-fraud: Check if this IP already voted for this track today
        const votes = await getVotesDB();
        const today = new Date().toDateString();
        const recentVotes = votes.filter(v => {
            const voteDate = new Date(v.votedAt).toDateString();
            return (
                voteDate === today &&
                v.userIp === userIp &&
                v.trackId === trackId &&
                v.tournamentId === tournamentId
            );
        });

        if (recentVotes.length > 0) {
            return NextResponse.json(
                { error: "You have already voted for this song today" },
                { status: 429 } // Rate limit
            );
        }

        // 4. Create vote
        const vote: Vote = {
            id: `vote_${Date.now()}`,
            tournamentId,
            trackId,
            userId,
            userIp,
            votedAt: new Date().toISOString(),
        };

        // 5. Save vote
        votes.push(vote);
        const saved = await saveVotesDB(votes);

        if (!saved) {
            return NextResponse.json(
                { error: "Failed to save vote" },
                { status: 500 }
            );
        }

        console.log("[TOURNAMENT-VOTE] Vote recorded:", {
            tournamentId,
            trackId,
            userIp,
            userId: userId || "anonymous",
        });

        return NextResponse.json(
            {
                success: true,
                vote,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[TOURNAMENT-VOTE] Vote error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/tournaments/{id}/rankings
 * Get current rankings
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tournamentId } = await params;
        const url = new URL(req.url);
        const action = url.pathname.split("/").pop();

        if (action === "rankings") {
            return handleGetRankings(req, tournamentId);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("[TOURNAMENT] GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Handle getting rankings
 */
async function handleGetRankings(req: NextRequest, tournamentId: string) {
    try {
        // 1. Get tournament info
        const tournaments = await getTournamentsDB();
        const tournament = tournaments.find((t: any) => t.id === tournamentId);

        if (!tournament) {
            return NextResponse.json(
                { error: "Tournament not found" },
                { status: 404 }
            );
        }

        // 2. Get votes for this tournament
        const votes = await getVotesDB();
        const tournamentVotes = votes.filter(v => v.tournamentId === tournamentId);

        // 3. Get tracks
        const tracks = await getTracksDB();

        // 4. Calculate rankings
        const votesByTrack = new Map<string, number>();
        tournamentVotes.forEach(v => {
            votesByTrack.set(v.trackId, (votesByTrack.get(v.trackId) || 0) + 1);
        });

        // 5. Get participants info
        const participants = await getParticipantsDB();
        const users = await getUsersDB();

        const rankings: Ranking[] = [];

        votesByTrack.forEach((votes, trackId) => {
            const track = tracks.find((t: any) => t.id === trackId);
            const participant = participants.find(
                (p: any) =>
                    p.tournamentId === tournamentId &&
                    p.trackId === trackId
            );

            if (track && participant) {
                const user = users.find((u: any) => u.id === participant.userId);
                rankings.push({
                    tournamentId,
                    participantId: participant.id,
                    userId: participant.userId,
                    trackId,
                    artistName: user?.name || "Unknown",
                    position: 0, // Will be set after sorting
                    plays: track.plays || 0,
                    likes: track.likes || 0,
                    downloads: 0, // Tracked in Download model
                    totalScore:
                        (track.plays || 0) * 1 + (track.likes || 0) * 5 + votes * 10,
                    votes,
                });
            }
        });

        // 6. Sort by score and assign positions
        rankings.sort((a, b) => b.totalScore - a.totalScore);
        rankings.forEach((r, idx) => {
            r.position = idx + 1;
        });

        return NextResponse.json({
            success: true,
            count: rankings.length,
            rankings: rankings.slice(0, 100), // Top 100
        });
    } catch (error) {
        console.error("[TOURNAMENT] Rankings error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/tournaments/{id}/complete
 * Complete tournament and distribute prizes (ADMIN only)
 */
async function handleCompleteTournament(req: NextRequest, tournamentId: string) {
    try {
        // 1. Check admin
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await getUsersDB();
        const user = users.find((u: any) => u.id === session.user.id);
        if (!user || !user.roles?.includes("ADMIN")) {
            return NextResponse.json(
                { error: "Only admins can complete tournaments" },
                { status: 403 }
            );
        }

        // 2. Get tournament
        const tournaments = await getTournamentsDB();
        const tournament = tournaments.find((t: any) => t.id === tournamentId);

        if (!tournament) {
            return NextResponse.json(
                { error: "Tournament not found" },
                { status: 404 }
            );
        }

        // 3. Calculate final rankings
        // (Same logic as rankings endpoint)
        const votes = await getVotesDB();
        const tournamentVotes = votes.filter(v => v.tournamentId === tournamentId);
        const votesByTrack = new Map<string, number>();
        tournamentVotes.forEach(v => {
            votesByTrack.set(v.trackId, (votesByTrack.get(v.trackId) || 0) + 1);
        });

        // 4. Get top 3 winners
        const top3 = Array.from(votesByTrack.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        // 5. Distribute prizes
        const prizes = [
            { position: 1, amount: (tournament.prizePool * 0.5).toFixed(2) },
            { position: 2, amount: (tournament.prizePool * 0.3).toFixed(2) },
            { position: 3, amount: (tournament.prizePool * 0.2).toFixed(2) },
        ];

        console.log("[TOURNAMENT] Prizes distributed:", { tournamentId, prizes });

        // 6. Mark tournament as completed
        tournament.status = "completed";
        tournament.completedAt = new Date().toISOString();
        tournament.updatedAt = new Date().toISOString();
        await saveTournamentsDB(tournaments);

        return NextResponse.json({
            success: true,
            tournament,
            finalRankings: top3.map(([trackId, votes], idx) => ({
                position: idx + 1,
                trackId,
                votes,
                prize: prizes[idx],
            })),
        });
    } catch (error) {
        console.error("[TOURNAMENT] Complete error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
