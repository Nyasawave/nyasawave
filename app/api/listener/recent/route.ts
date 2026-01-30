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
    const recentSongs: any[] = [];

    return NextResponse.json(recentSongs);
}
