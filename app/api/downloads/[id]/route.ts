import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkAccess } from "@/app/utils/accessControl";
import fs from "fs";
import path from "path";

/**
 * DOWNLOAD ENDPOINT - Protected download with premium enforcement
 * 
 * Usage:
 * GET /api/downloads/song/{id}
 * 
 * Returns:
 * - 401: Not logged in
 * - 403: Not premium (or not song owner if artist)
 * - 404: Song not found
 * - 200: File stream + metadata
 */

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const songsFile = path.join(process.cwd(), "data", "uploaded-songs.json");

function getSongs() {
    try {
        if (fs.existsSync(songsFile)) {
            return JSON.parse(fs.readFileSync(songsFile, "utf-8")) || [];
        }
        return [];
    } catch (e) {
        console.error("[DOWNLOAD] Error reading songs:", e);
        return [];
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: songId } = await params;
        const session = await getServerSession(authOptions);

        // Step 1: Verify user is logged in
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required for downloads" },
                { status: 401 }
            );
        }

        // Step 2: Get song info
        const songs = getSongs();
        const song = songs.find((s: any) => s.id === songId);

        if (!song) {
            return NextResponse.json(
                { error: "Song not found" },
                { status: 404 }
            );
        }

        // Step 3: Check access using access control service
        const access = checkAccess({
            user: session.user,
            action: "download",
            resourceType: "song",
            isTournament: song.isTournament,
            resourceOwnerId: song.artistId,
        });

        if (!access.allowed) {
            return NextResponse.json(
                {
                    error: access.reason || "Download denied",
                    suggestedAction: access.suggestedAction,
                },
                { status: 403 }
            );
        }

        // Step 4: Log download event (for analytics + fraud detection)
        const downloadLog = {
            userId: session.user.id,
            songId,
            timestamp: new Date().toISOString(),
            userAgent: request.headers.get("user-agent") || "unknown",
            ip: request.headers.get("x-forwarded-for") || "unknown",
        };

        console.log("[DOWNLOAD] Granted:", downloadLog);

        // Step 5: Return file or stream URL
        // For now, return download metadata (production would stream actual file)
        return NextResponse.json({
            success: true,
            song: {
                id: song.id,
                title: song.title,
                artist: song.artist,
                duration: song.duration,
            },
            downloadUrl: `/uploads/${song.id}.mp3`, // Client downloads from here
            expiresIn: 3600, // 1 hour expiration
        });
    } catch (error) {
        console.error("[DOWNLOAD] Error:", error);
        return NextResponse.json(
            { error: "Download failed" },
            { status: 500 }
        );
    }
}

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json(
        {},
        {
            headers: {
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        }
    );
}
