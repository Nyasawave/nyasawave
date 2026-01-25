import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "users.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "tracks");

/**
 * TRACK UPLOAD ENDPOINT
 * 
 * POST /api/tracks/upload
 * 
 * Multipart form data:
 * - audio: File (mp3, wav, ogg)
 * - metadata: JSON string { title, description, genre, duration }
 * - artwork?: File (jpg, png)
 * 
 * Returns: { success, trackId, track: { id, title, audioUrl, coverArt, ... } }
 */

interface TrackMetadata {
    title: string;
    description?: string;
    genre: string;
    duration: number;
}

interface TrackRecord {
    id: string;
    artistId: string;
    title: string;
    description?: string;
    audioUrl: string;
    coverArt?: string;
    duration: number;
    genre: string;
    plays: number;
    likes: number;
    isBoosted: boolean;
    isReleased: boolean;
    createdAt: string;
    updatedAt: string;
}

// Helper: Read users DB
async function readUsersDB() {
    try {
        const content = await fs.readFile(DB_PATH, "utf-8");
        return JSON.parse(content) || [];
    } catch (e) {
        return [];
    }
}

// Helper: Write users DB
async function writeUsersDB(users: any[]) {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));
        return true;
    } catch (e) {
        console.error("[UPLOAD] Error writing DB:", e);
        return false;
    }
}

// Helper: Get or create tracks.json
async function getTracksDB(): Promise<TrackRecord[]> {
    try {
        const tracksPath = path.join(process.cwd(), "data", "tracks.json");
        if (existsSync(tracksPath)) {
            const content = await fs.readFile(tracksPath, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        console.error("[UPLOAD] Error reading tracks:", e);
        return [];
    }
}

// Helper: Save tracks.json
async function saveTracksDB(tracks: TrackRecord[]) {
    try {
        const tracksPath = path.join(process.cwd(), "data", "tracks.json");
        await fs.writeFile(tracksPath, JSON.stringify(tracks, null, 2));
        return true;
    } catch (e) {
        console.error("[UPLOAD] Error saving tracks:", e);
        return false;
    }
}

// Helper: Validate audio file
function isValidAudioFile(filename: string): boolean {
    const validExtensions = ["mp3", "wav", "ogg", "m4a", "flac"];
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext ? validExtensions.includes(ext) : false;
}

// Helper: Validate image file
function isValidImageFile(filename: string): boolean {
    const validExtensions = ["jpg", "jpeg", "png", "webp"];
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext ? validExtensions.includes(ext) : false;
}

// Helper: Get artist ID from user
async function getArtistId(userId: string): Promise<string | null> {
    try {
        const users = await readUsersDB();
        const user = users.find((u: any) => u.id === userId);

        if (!user) return null;

        // Create artistId if not exists
        let artistId = user.artistId;
        if (!artistId) {
            artistId = `artist_${Date.now()}`;
            user.artistId = artistId;
            await writeUsersDB(users);
        }

        return artistId;
    } catch (e) {
        console.error("[UPLOAD] Error getting artist ID:", e);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        // 1. Get session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Check if user is artist
        const users = await readUsersDB();
        const user = users.find((u: any) => u.id === session.user.id);
        if (!user || !user.roles?.includes("ARTIST")) {
            return NextResponse.json(
                { error: "Only artists can upload tracks" },
                { status: 403 }
            );
        }

        console.log("[UPLOAD] Artist:", user.email, "User ID:", session.user.id);

        // 3. Get artist ID
        const artistId = await getArtistId(session.user.id);
        if (!artistId) {
            return NextResponse.json(
                { error: "Failed to get artist profile" },
                { status: 500 }
            );
        }

        console.log("[UPLOAD] Artist ID:", artistId);

        // 4. Parse multipart form
        const formData = await req.formData();
        const audioFile = formData.get("audio") as File | null;
        const metadataStr = formData.get("metadata") as string | null;
        const artworkFile = formData.get("artwork") as File | null;

        // 5. Validate inputs
        if (!audioFile) {
            return NextResponse.json(
                { error: "Audio file is required" },
                { status: 400 }
            );
        }

        if (!isValidAudioFile(audioFile.name)) {
            return NextResponse.json(
                { error: "Invalid audio format. Allowed: mp3, wav, ogg, m4a, flac" },
                { status: 400 }
            );
        }

        if (!metadataStr) {
            return NextResponse.json(
                { error: "Metadata is required" },
                { status: 400 }
            );
        }

        let metadata: TrackMetadata;
        try {
            metadata = JSON.parse(metadataStr);
        } catch (e) {
            return NextResponse.json(
                { error: "Invalid metadata JSON" },
                { status: 400 }
            );
        }

        if (!metadata.title || metadata.title.trim().length === 0) {
            return NextResponse.json(
                { error: "Track title is required" },
                { status: 400 }
            );
        }

        if (!metadata.genre) {
            return NextResponse.json(
                { error: "Genre is required" },
                { status: 400 }
            );
        }

        if (typeof metadata.duration !== "number" || metadata.duration <= 0) {
            return NextResponse.json(
                { error: "Valid duration is required" },
                { status: 400 }
            );
        }

        // 6. Create uploads directory if needed
        if (!existsSync(UPLOADS_DIR)) {
            await mkdir(UPLOADS_DIR, { recursive: true });
        }

        // 7. Save audio file
        const audioBuffer = await audioFile.arrayBuffer();
        const audioExt = audioFile.name.split(".").pop();
        const audioFilename = `${artistId}_${Date.now()}.${audioExt}`;
        const audioPath = join(UPLOADS_DIR, audioFilename);
        const audioUrl = `/uploads/tracks/${audioFilename}`;

        await writeFile(audioPath, Buffer.from(audioBuffer));
        console.log("[UPLOAD] Audio saved:", audioPath);

        // 8. Save artwork if provided
        let coverArt: string | undefined;
        if (artworkFile && isValidImageFile(artworkFile.name)) {
            const artworkBuffer = await artworkFile.arrayBuffer();
            const artworkExt = artworkFile.name.split(".").pop();
            const artworkFilename = `${artistId}_${Date.now()}_cover.${artworkExt}`;
            const artworkPath = join(UPLOADS_DIR, artworkFilename);
            coverArt = `/uploads/tracks/${artworkFilename}`;

            await writeFile(artworkPath, Buffer.from(artworkBuffer));
            console.log("[UPLOAD] Artwork saved:", artworkPath);
        }

        // 9. Create track record
        const trackId = `track_${Date.now()}`;
        const now = new Date().toISOString();

        const track: TrackRecord = {
            id: trackId,
            artistId,
            title: metadata.title.trim(),
            description: metadata.description?.trim(),
            audioUrl,
            coverArt,
            duration: metadata.duration,
            genre: metadata.genre,
            plays: 0,
            likes: 0,
            isBoosted: false,
            isReleased: true,
            createdAt: now,
            updatedAt: now,
        };

        // 10. Save to tracks database
        const tracks = await getTracksDB();
        tracks.push(track);
        const saved = await saveTracksDB(tracks);

        if (!saved) {
            return NextResponse.json(
                { error: "Failed to save track metadata" },
                { status: 500 }
            );
        }

        // 11. Update user to include trackId
        user.uploadedTracks = user.uploadedTracks || [];
        user.uploadedTracks.push(trackId);
        user.updatedAt = now;
        await writeUsersDB(users);

        console.log("[UPLOAD] Track created successfully:", {
            id: trackId,
            title: track.title,
            artist: user.email,
        });

        return NextResponse.json(
            {
                success: true,
                trackId,
                track: {
                    id: track.id,
                    title: track.title,
                    description: track.description,
                    audioUrl: track.audioUrl,
                    coverArt: track.coverArt,
                    duration: track.duration,
                    genre: track.genre,
                    createdAt: track.createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[UPLOAD] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/tracks/upload?artistId=xxx
 * Get all tracks for an artist
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const artistId = searchParams.get("artistId");

        if (!artistId) {
            return NextResponse.json(
                { error: "artistId parameter is required" },
                { status: 400 }
            );
        }

        const tracks = await getTracksDB();
        const artistTracks = tracks.filter(t => t.artistId === artistId);

        return NextResponse.json({
            success: true,
            count: artistTracks.length,
            tracks: artistTracks,
        });
    } catch (error) {
        console.error("[UPLOAD] GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
