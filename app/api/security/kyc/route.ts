import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as fs from "fs";
import * as path from "path";

const KYC_DATA_FILE = path.join(process.cwd(), "data", "kyc-verification.json");

interface KYCVerification {
    userId: string;
    status: "pending" | "verified" | "rejected";
    fullName: string;
    idType: "passport" | "national_id" | "driver_license";
    idNumber: string;
    dateOfBirth: string;
    country: string;
    verificationDate?: number;
    rejectionReason?: string;
}

function getKYCData(): KYCVerification[] {
    if (!fs.existsSync(KYC_DATA_FILE)) {
        return [];
    }
    return JSON.parse(fs.readFileSync(KYC_DATA_FILE, "utf-8"));
}

function saveKYCData(data: KYCVerification[]): void {
    if (!fs.existsSync(path.dirname(KYC_DATA_FILE))) {
        fs.mkdirSync(path.dirname(KYC_DATA_FILE), { recursive: true });
    }
    fs.writeFileSync(KYC_DATA_FILE, JSON.stringify(data, null, 2));
}

/**
 * KYC & ACCOUNT VERIFICATION
 * 
 * Phase 16: Production Hardening
 * 
 * Features:
 * - Know Your Customer (KYC) verification
 * - Identity verification
 * - Account verification status
 * - Compliance tracking
 */

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action } = body;

        if (!action) {
            return NextResponse.json(
                { error: "Action is required" },
                { status: 400 }
            );
        }

        if (action === "submit-kyc") {
            // Submit KYC verification
            const { fullName, idType, idNumber, dateOfBirth, country } = body;

            if (!fullName || !idType || !idNumber || !dateOfBirth || !country) {
                return NextResponse.json(
                    { error: "All KYC fields are required" },
                    { status: 400 }
                );
            }

            // Validate ID number format
            if (!/^[A-Z0-9]{5,20}$/.test(idNumber)) {
                return NextResponse.json(
                    { error: "Invalid ID number format" },
                    { status: 400 }
                );
            }

            // Validate date of birth (must be 18+)
            const dob = new Date(dateOfBirth);
            const age = new Date().getFullYear() - dob.getFullYear();

            if (age < 18) {
                return NextResponse.json(
                    { error: "Must be at least 18 years old" },
                    { status: 400 }
                );
            }

            const kycData = getKYCData();

            // Check if already verified
            const existing = kycData.find((k) => k.userId === session.user.id);
            if (existing?.status === "verified") {
                return NextResponse.json(
                    { error: "User is already verified" },
                    { status: 400 }
                );
            }

            const verification: KYCVerification = {
                userId: session.user.id,
                status: "pending",
                fullName,
                idType,
                idNumber,
                dateOfBirth,
                country,
            };

            if (existing) {
                const index = kycData.findIndex((k) => k.userId === session.user.id);
                kycData[index] = verification;
            } else {
                kycData.push(verification);
            }

            saveKYCData(kycData);

            return NextResponse.json(
                {
                    message: "KYC submission successful",
                    status: "pending",
                    estimatedReviewTime: "24-48 hours",
                },
                { status: 201 }
            );
        }

        if (action === "get-status") {
            // Get KYC verification status
            const kycData = getKYCData();
            const verification = kycData.find((k) => k.userId === session.user.id);

            if (!verification) {
                return NextResponse.json(
                    { status: "not_submitted" },
                    { status: 200 }
                );
            }

            return NextResponse.json(
                {
                    status: verification.status,
                    submittedAt: verification.verificationDate,
                    rejectionReason: verification.rejectionReason,
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
        );
    } catch (error) {
        console.error("KYC error:", error);
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

        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get("action") || "status";

        if (action === "status") {
            // Get user's verification status
            const kycData = getKYCData();
            const verification = kycData.find((k) => k.userId === session.user.id);

            if (!verification) {
                return NextResponse.json(
                    {
                        verified: false,
                        status: "not_submitted",
                    },
                    { status: 200 }
                );
            }

            return NextResponse.json(
                {
                    verified: verification.status === "verified",
                    status: verification.status,
                    country: verification.country,
                },
                { status: 200 }
            );
        }

        // Admin action: Get all pending verifications
        if (action === "pending" && session.user?.role === "ADMIN") {
            const kycData = getKYCData();
            const pending = kycData.filter((k) => k.status === "pending");

            return NextResponse.json(
                {
                    count: pending.length,
                    verifications: pending,
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { error: "Invalid query" },
            { status: 400 }
        );
    } catch (error) {
        console.error("KYC error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Admin only
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { userId, action, rejectionReason } = body;

        if (!userId || !action) {
            return NextResponse.json(
                { error: "userId and action are required" },
                { status: 400 }
            );
        }

        const kycData = getKYCData();
        const index = kycData.findIndex((k) => k.userId === userId);

        if (index === -1) {
            return NextResponse.json(
                { error: "KYC record not found" },
                { status: 404 }
            );
        }

        if (action === "approve") {
            kycData[index].status = "verified";
            kycData[index].verificationDate = Date.now();
        } else if (action === "reject") {
            kycData[index].status = "rejected";
            kycData[index].rejectionReason =
                rejectionReason || "KYC verification failed";
        } else {
            return NextResponse.json(
                { error: "Invalid action" },
                { status: 400 }
            );
        }

        saveKYCData(kycData);

        return NextResponse.json(
            {
                message: `KYC ${action === "approve" ? "approved" : "rejected"}`,
                status: kycData[index].status,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("KYC error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
