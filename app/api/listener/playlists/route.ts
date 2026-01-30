import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a listener
    if (!(session.user as any).roles?.includes("LISTENER")) {
        return NextResponse.json({ error: "Not a listener" }, { status: 403 });
    }

    // TODO: Query from database using session.user.id
    // For now, return empty array with proper structure
    const playlists: any[] = [];

    return NextResponse.json(playlists);
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(session.user as any).roles?.includes("LISTENER")) {
        return NextResponse.json({ error: "Not a listener" }, { status: 403 });
    }

    try {
        const body = await request.json();

        // Validate input
        if (!body.name || body.name.trim() === "") {
            return NextResponse.json({ error: "Playlist name is required" }, { status: 400 });
        }

        // TODO: Create playlist in database
        const newPlaylist = {
            id: "playlist_" + Date.now(),
            name: body.name,
            description: body.description || "",
            userId: session.user.id,
            songs: [],
            createdAt: new Date(),
        };

        return NextResponse.json(newPlaylist, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 });
    }
}
