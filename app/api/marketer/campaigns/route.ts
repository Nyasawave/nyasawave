import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a marketer
    if (!(session.user as any).roles?.includes("MARKETER")) {
        return NextResponse.json({ error: "Not a marketer" }, { status: 403 });
    }

    // TODO: Query from database using session.user.id
    // For now, return empty array
    const campaigns: any[] = [];

    return NextResponse.json(campaigns);
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(session.user as any).roles?.includes("MARKETER")) {
        return NextResponse.json({ error: "Not a marketer" }, { status: 403 });
    }

    try {
        const body = await request.json();

        if (!body.name || body.name.trim() === "") {
            return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
        }

        // TODO: Create campaign in database
        const newCampaign = {
            id: "campaign_" + Date.now(),
            name: body.name,
            description: body.description || "",
            budget: body.budget || 0,
            startDate: body.startDate,
            endDate: body.endDate,
            status: "draft",
            userId: session.user.id,
            createdAt: new Date(),
        };

        return NextResponse.json(newCampaign, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
    }
}
