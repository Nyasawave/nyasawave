import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

/**
 * TRACK PLAY TRACKING ENDPOINT
 * 
 * POST /api/tracks/play - Record track play
 * POST /api/tracks/{id}/like - Like/unlike track
 * POST /api/tracks/{id}/download - Download track
 */

const TRACKS_PATH = path.join(process.cwd(), "data", "tracks.json");
const PLAY_HISTORY_PATH = path.join(process.cwd(), "data", "play-history.json");
const LIKES_PATH = path.join(process.cwd(), "data", "track-likes.json");

// Helper functions
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function getTracksDB(): Promise<any[]> {
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

async function saveTracksDB(tracks: any[]) {
    try {
        const dir = path.dirname(TRACKS_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(TRACKS_PATH, JSON.stringify(tracks, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

async function getPlayHistoryDB(): Promise<any[]> {
    try {
        if (await fileExists(PLAY_HISTORY_PATH)) {
            const content = await fs.readFile(PLAY_HISTORY_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function savePlayHistoryDB(history: any[]) {
    try {
        const dir = path.dirname(PLAY_HISTORY_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(PLAY_HISTORY_PATH, JSON.stringify(history, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

async function getLikesDB(): Promise<any[]> {
    try {
        if (await fileExists(LIKES_PATH)) {
            const content = await fs.readFile(LIKES_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function saveLikesDB(likes: any[]) {
    try {
        const dir = path.dirname(LIKES_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(LIKES_PATH, JSON.stringify(likes, null, 2));
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
 * POST /api/tracks/play
 * Record track play
 */
export async function POST(req: NextRequest) {
    try {
        const { trackId } = await req.json();

        if (!trackId) {
            return NextResponse.json(
                { error: "trackId is required" },
                { status: 400 }
            );
        }

        // 1. Get user (optional for analytics)
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // 2. Get track
        const tracks = await getTracksDB();
        const track = tracks.find((t: any) => t.id === trackId);

        if (!track) {
            return NextResponse.json(
                { error: "Track not found" },
                { status: 404 }
            );
        }

        // 3. Increment play count
        track.plays = (track.plays || 0) + 1;
        track.updatedAt = new Date().toISOString();
        await saveTracksDB(tracks);

        // 4. Record in play history
        const history = await getPlayHistoryDB();
        history.push({
            id: `play_${Date.now()}`,
            trackId,
            userId,
            playedAt: new Date().toISOString(),
        });

        // Keep last 10000 plays to avoid infinite growth
        if (history.length > 10000) {
            history.splice(0, history.length - 10000);
        }

        await savePlayHistoryDB(history);

        console.log("[TRACKS] Play recorded:", {
            trackId,
            userId: userId || "anonymous",
            totalPlays: track.plays,
        });

        return NextResponse.json({
            success: true,
            track,
        });
    } catch (error) {
        console.error("[TRACKS] Play error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/tracks/{id}/like
 * Like/unlike track
 */
export async function PATCH(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const pathParts = url.pathname.split("/");
        const trackId = pathParts[pathParts.length - 2];
        const action = url.pathname.split("/").pop();

        if (action === "like") {
            return handleLike(req, trackId);
        } else if (action === "download") {
            return handleDownload(req, trackId);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("[TRACKS] PATCH error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Handle liking track
 */
async function handleLike(req: NextRequest, trackId: string) {
    try {
        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // 2. Get track
        const tracks = await getTracksDB();
        const track = tracks.find((t: any) => t.id === trackId);

        if (!track) {
            return NextResponse.json(
                { error: "Track not found" },
                { status: 404 }
            );
        }

        // 3. Get likes
        const likes = await getLikesDB();
        const likeIndex = likes.findIndex(
            (l: any) => l.trackId === trackId && l.userId === userId
        );

        // 4. Toggle like
        if (likeIndex >= 0) {
            // Unlike
            likes.splice(likeIndex, 1);
            track.likes = Math.max(0, (track.likes || 0) - 1);
        } else {
            // Like
            likes.push({
                id: `like_${Date.now()}`,
                trackId,
                userId,
                likedAt: new Date().toISOString(),
            });
            track.likes = (track.likes || 0) + 1;
        }

        track.updatedAt = new Date().toISOString();

        // 5. Save
        await saveTracksDB(tracks);
        await saveLikesDB(likes);

        console.log("[TRACKS] Like toggled:", {
            trackId,
            userId,
            liked: likeIndex < 0,
            totalLikes: track.likes,
        });

        return NextResponse.json({
            success: true,
            track,
            liked: likeIndex < 0,
        });
    } catch (error) {
        console.error("[TRACKS] Like error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Handle downloading track
 */
async function handleDownload(req: NextRequest, trackId: string) {
    try {
        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // 2. Get user (check premium)
        const users = await getUsersDB();
        const user = users.find((u: any) => u.id === userId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // 3. Check premium status
        const isPremium = user.subscriptionTier === "premium" || user.isPremiumListener;

        if (!isPremium) {
            return NextResponse.json(
                {
                    error: "Premium subscription required for downloads",
                },
                { status: 403 }
            );
        }

        // 4. Get track
        const tracks = await getTracksDB();
        const track = tracks.find((t: any) => t.id === trackId);

        if (!track) {
            return NextResponse.json(
                { error: "Track not found" },
                { status: 404 }
            );
        }

        // 5. Increment downloads
        track.downloads = (track.downloads || 0) + 1;
        track.updatedAt = new Date().toISOString();
        await saveTracksDB(tracks);

        console.log("[TRACKS] Download recorded:", {
            trackId,
            userId,
            totalDownloads: track.downloads,
        });

        // 6. Return download URL
        return NextResponse.json({
            success: true,
            downloadUrl: track.url,
            fileName: `${track.title || "track"}.${track.url.split(".").pop()}`,
        });
    } catch (error) {
        console.error("[TRACKS] Download error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

