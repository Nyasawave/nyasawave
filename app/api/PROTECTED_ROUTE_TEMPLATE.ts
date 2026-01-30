import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

/**
 * TEMPLATE: Protected API Route
 * 
 * Use this template for all protected API routes
 * Automatically validates:
 * - User is authenticated
 * - User has required role
 * - Session is valid
 * 
 * Copy this to any route that needs protection, then add your logic
 */

export async function GET(request: NextRequest) {
    try {
        // 1. Get session (NextAuth validates JWT)
        const session = await getServerSession(authOptions);

        // 2. Check authentication
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized - no session" },
                { status: 401 }
            );
        }

        // 3. Check role (customize as needed)
        const allowedRoles = ["ARTIST", "ADMIN"]; // Change for your endpoint
        if (!allowedRoles.includes(session.user.role || "")) {
            return NextResponse.json(
                { error: "Forbidden - insufficient permissions" },
                { status: 403 }
            );
        }

        // 4. User is authenticated with correct role
        const userId = session.user.id;
        const userRole = session.user.role;

        console.log(`[API] GET request from ${userRole} user: ${userId}`);

        // ============= YOUR LOGIC HERE =============
        // Now you can safely:
        // - Query database for this user's data
        // - Perform actions only this role can do
        // - Trust that user identity is verified

        return NextResponse.json(
            { message: "Success", userId, userRole },
            { status: 200 }
        );
        // ==========================================

    } catch (error) {
        console.error("[API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // 1. Get session
        const session = await getServerSession(authOptions);

        // 2. Check authentication
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized - no session" },
                { status: 401 }
            );
        }

        // 3. Check role
        const allowedRoles = ["ARTIST", "ADMIN"];
        if (!allowedRoles.includes(session.user.role || "")) {
            return NextResponse.json(
                { error: "Forbidden - insufficient permissions" },
                { status: 403 }
            );
        }

        // 4. Parse request body
        const body = await request.json();

        const userId = session.user.id;
        const userRole = session.user.role;

        console.log(`[API] POST request from ${userRole} user: ${userId}`, body);

        // ============= YOUR LOGIC HERE =============
        // Safely process the POST request

        return NextResponse.json(
            { message: "Created successfully", userId, userRole },
            { status: 201 }
        );
        // ==========================================

    } catch (error) {
        console.error("[API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
