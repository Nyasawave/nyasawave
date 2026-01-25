import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import fs from "fs";
import path from "path";

const DB = path.join(process.cwd(), "data", "users.json");

function readUsers() {
    try {
        if (fs.existsSync(DB)) {
            return JSON.parse(fs.readFileSync(DB, "utf-8")) || [];
        }
        return [];
    } catch (e) {
        console.error("[AUTH] Error reading users:", e);
        return [];
    }
}

function writeUsers(users: any[]) {
    try {
        fs.writeFileSync(DB, JSON.stringify(users, null, 2));
        return true;
    } catch (e) {
        console.error("[AUTH] Error writing users:", e);
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { persona } = await request.json();

        if (!persona) {
            return NextResponse.json(
                { error: "Persona is required" },
                { status: 400 }
            );
        }

        const users = readUsers();
        const userIndex = users.findIndex((u: any) => u.id === session.user.id);

        if (userIndex === -1) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const user = users[userIndex];

        // Check if user has this role
        if (!user.roles.includes(persona)) {
            return NextResponse.json(
                { error: "User does not have this role" },
                { status: 403 }
            );
        }

        // Update active persona
        user.activePersona = persona;
        user.updatedAt = new Date().toISOString();

        if (!writeUsers(users)) {
            return NextResponse.json(
                { error: "Failed to update persona" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            activePersona: user.activePersona,
            message: `Switched to ${persona} persona`,
        });
    } catch (error) {
        console.error("[AUTH] Switch persona error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const users = readUsers();
        const user = users.find((u: any) => u.id === session.user.id);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            roles: user.roles || [],
            activePersona: user.activePersona || user.roles?.[0] || "LISTENER",
            premiumListener: user.premiumListener || false,
            verified: user.verified || false,
        });
    } catch (error) {
        console.error("[AUTH] Get persona error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
