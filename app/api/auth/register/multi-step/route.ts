import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../[...nextauth]/route";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";

const DB = path.join(process.cwd(), "data", "users.json");

/**
 * MULTI-STEP REGISTRATION ENDPOINT
 * Handles all 4 steps: Role -> Personal Details -> Role Details -> Payment
 * 
 * POST /api/auth/register/multi-step
 * 
 * Request body:
 * {
 *   primaryRole: "ARTIST" | "LISTENER" | "ENTREPRENEUR" | "MARKETER",
 *   personalDetails: { firstName, lastName, email, phone, country, city, password, acceptTerms },
 *   artistDetails?: { stageName, genres, bio },
 *   entrepreneurDetails?: { businessName, businessCategory, businessLocation },
 *   marketerDetails?: { marketingFocus, platformsUsed, portfolioLinks },
 *   paymentSetup?: { provider, customerId, verified }
 * }
 */

interface PersonalDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    password: string;
    acceptTerms: boolean;
}

interface ArtistDetails {
    stageName: string;
    genres: string[];
    bio: string;
}

interface EntrepreneurDetails {
    businessName: string;
    businessCategory: string;
    businessLocation: string;
}

interface MarketerDetails {
    marketingFocus: string;
    platformsUsed: string[];
    portfolioLinks: string[];
}

interface MultiStepRegistrationBody {
    primaryRole: "ARTIST" | "LISTENER" | "ENTREPRENEUR" | "MARKETER";
    personalDetails: PersonalDetails;
    artistDetails?: ArtistDetails;
    entrepreneurDetails?: EntrepreneurDetails;
    marketerDetails?: MarketerDetails;
    paymentSetup?: {
        provider: "stripe" | "flutterwave" | null;
        customerId: string;
        verified: boolean;
    };
}

// Helper: Read users from JSON DB
async function readUsers() {
    try {
        if (await fileExists(DB)) {
            const content = await fs.readFile(DB, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        console.error("[REGISTER/MULTI-STEP] Error reading users:", e);
        return [];
    }
}

// Helper: Write users to JSON DB
async function writeUsers(users: any[]) {
    try {
        const dir = path.dirname(DB);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(DB, JSON.stringify(users, null, 2));
        return true;
    } catch (e) {
        console.error("[REGISTER/MULTI-STEP] Error writing users:", e);
        return false;
    }
}

// Helper: Check if file exists
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Helper: Hash password
async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Helper: Validate multi-step registration data
function validateRegistration(body: MultiStepRegistrationBody): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!body.primaryRole) {
        errors.push("Primary role is required");
    }

    // Validate personal details
    if (!body.personalDetails) {
        errors.push("Personal details are required");
        return { valid: false, errors };
    }

    const { firstName, lastName, email, password, acceptTerms } = body.personalDetails;

    if (!firstName?.trim()) errors.push("First name is required");
    if (!lastName?.trim()) errors.push("Last name is required");
    if (!email || !email.includes("@")) errors.push("Valid email is required");
    if (!password || password.length < 6) errors.push("Password must be at least 6 characters");
    if (!acceptTerms) errors.push("You must accept the terms and conditions");

    // Validate role-specific details
    if (body.primaryRole === "ARTIST" && body.artistDetails) {
        if (!body.artistDetails.stageName?.trim()) {
            errors.push("Stage name is required for artists");
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

export async function POST(req: NextRequest) {
    try {
        const body: MultiStepRegistrationBody = await req.json();

        console.log("[REGISTER/MULTI-STEP] Request received:", {
            role: body.primaryRole,
            email: body.personalDetails?.email,
            hasPassword: !!body.personalDetails?.password,
        });

        // Validate
        const validation = validateRegistration(body);
        if (!validation.valid) {
            console.log("[REGISTER/MULTI-STEP] Validation errors:", validation.errors);
            return NextResponse.json(
                { error: validation.errors.join(", ") },
                { status: 400 }
            );
        }

        const { primaryRole, personalDetails } = body;
        const { firstName, lastName, email, password } = personalDetails;

        // Check if user already exists
        const users = await readUsers();
        if (users.find((u: any) => u.email === email)) {
            console.log("[REGISTER/MULTI-STEP] User already exists:", email);
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Build roles array
        let roles: string[] = [primaryRole];
        if (primaryRole !== "LISTENER") {
            roles.push("LISTENER"); // Everyone gets listener
        }

        // Special case: admin
        if (email === "trapkost2020@gmail.com") {
            roles = ["ADMIN"];
        }

        const now = new Date().toISOString();

        // Create user object
        const newUser = {
            id: `user_${Date.now()}`,
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            roles,
            activePersona: primaryRole,
            premiumListener: false,
            verified: false,
            phone: personalDetails.phone,
            country: personalDetails.country,
            city: personalDetails.city,
            acceptTerms: personalDetails.acceptTerms,
            createdAt: now,
            updatedAt: now,

            // Role-specific details
            artistDetails:
                primaryRole === "ARTIST"
                    ? {
                        stageName: body.artistDetails?.stageName || `${firstName} ${lastName}`,
                        genres: body.artistDetails?.genres || [],
                        bio: body.artistDetails?.bio || "",
                    }
                    : undefined,

            entrepreneurDetails:
                primaryRole === "ENTREPRENEUR"
                    ? {
                        businessName: body.entrepreneurDetails?.businessName || "",
                        businessCategory: body.entrepreneurDetails?.businessCategory || "",
                        businessLocation: body.entrepreneurDetails?.businessLocation || "",
                    }
                    : undefined,

            marketerDetails:
                primaryRole === "MARKETER"
                    ? {
                        marketingFocus: body.marketerDetails?.marketingFocus || "",
                        platformsUsed: body.marketerDetails?.platformsUsed || [],
                        portfolioLinks: body.marketerDetails?.portfolioLinks || [],
                    }
                    : undefined,

            // Payment setup (optional)
            paymentSetup: body.paymentSetup || {
                provider: null,
                customerId: "",
                verified: false,
            },
        };

        // Save to database
        users.push(newUser);
        const saved = await writeUsers(users);

        if (!saved) {
            console.error("[REGISTER/MULTI-STEP] Failed to save user");
            return NextResponse.json(
                { error: "Failed to save user" },
                { status: 500 }
            );
        }

        console.log("[REGISTER/MULTI-STEP] User created successfully:", {
            id: newUser.id,
            email: newUser.email,
            roles: newUser.roles,
        });

        // Return success (don't expose password or sensitive data)
        return NextResponse.json(
            {
                success: true,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    roles: newUser.roles,
                    activePersona: newUser.activePersona,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[REGISTER/MULTI-STEP] Error:", error);

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Validation endpoint to check email availability
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json(
                { error: "Email parameter is required" },
                { status: 400 }
            );
        }

        if (!email.includes("@")) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        const users = await readUsers();
        const exists = users.some((u: any) => u.email === email);

        return NextResponse.json({ available: !exists });
    } catch (error) {
        console.error("[REGISTER/MULTI-STEP] GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
