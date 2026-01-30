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

/**
 * POST /api/auth/switch-role
 * Switch the user's active role (without logout)
 * 
 * Body: { role: "ARTIST" | "LISTENER" | "ENTREPRENEUR" | "MARKETER" | "ADMIN" }
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { role } = await request.json();

        if (!role) {
            return NextResponse.json(
                { error: "Role is required" },
                { status: 400 }
            );
        }

        // Validate role is one of the allowed roles
        const VALID_ROLES = ["ADMIN", "ARTIST", "LISTENER", "ENTREPRENEUR", "MARKETER"];
        if (!VALID_ROLES.includes(role)) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        const users = readUsers();
        const user = users.find((u: any) => u.email === session.user?.email);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Verify user has this role
        if (!user.roles || !user.roles.includes(role)) {
            return NextResponse.json(
                { error: "User does not have this role" },
                { status: 403 }
            );
        }

        // Update active persona
        user.activePersona = role;

        // Persist to database
        if (!writeUsers(users)) {
            return NextResponse.json(
                { error: "Failed to save role change" },
                { status: 500 }
            );
        }

        console.log(`[SWITCH-ROLE] ✓ Role switched for ${session.user?.email} to ${role}`);

        // CRITICAL: Return updated user object with new role
        // This allows the client to update session context
        return NextResponse.json({
            success: true,
            message: `Switched to ${role} role`,
            activePersona: role,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
                activePersona: role,
                premiumListener: user.premiumListener,
                verified: user.verified,
            },
        }, {
            headers: {
                // This allows the browser to refresh the session automatically
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        });
    } catch (error) {
        console.error("[AUTH] Switch role error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/auth/switch-role
 * Get available roles for current user
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const users = readUsers();
        const user = users.find((u: any) => u.email === session.user?.email);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            activePersona: user.activePersona,
            availableRoles: user.roles || ["LISTENER"],
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
                activePersona: user.activePersona,
            },
        });
    } catch (error) {
        console.error("[AUTH] Get roles error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
