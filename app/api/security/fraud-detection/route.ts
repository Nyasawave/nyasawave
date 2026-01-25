import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as fs from "fs";
import * as path from "path";

const FRAUD_DATA_FILE = path.join(process.cwd(), "data", "fraud-detection.json");
const RATE_LIMIT_FILE = path.join(process.cwd(), "data", "rate-limits.json");

interface FraudPattern {
    userId: string;
    type: "duplicate_payment" | "suspicious_login" | "velocity_abuse" | "account_creation_spam";
    timestamp: number;
    severity: "low" | "medium" | "high";
    details: Record<string, any>;
}

interface RateLimit {
    ip: string;
    endpoint: string;
    count: number;
    resetTime: number;
}

function getFraudData(): FraudPattern[] {
    if (!fs.existsSync(FRAUD_DATA_FILE)) {
        return [];
    }
    return JSON.parse(fs.readFileSync(FRAUD_DATA_FILE, "utf-8"));
}

function saveFraudData(data: FraudPattern[]): void {
    if (!fs.existsSync(path.dirname(FRAUD_DATA_FILE))) {
        fs.mkdirSync(path.dirname(FRAUD_DATA_FILE), { recursive: true });
    }
    fs.writeFileSync(FRAUD_DATA_FILE, JSON.stringify(data, null, 2));
}

function getRateLimitData(): RateLimit[] {
    if (!fs.existsSync(RATE_LIMIT_FILE)) {
        return [];
    }
    return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, "utf-8"));
}

function saveRateLimitData(data: RateLimit[]): void {
    if (!fs.existsSync(path.dirname(RATE_LIMIT_FILE))) {
        fs.mkdirSync(path.dirname(RATE_LIMIT_FILE), { recursive: true });
    }
    fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
}

/**
 * FRAUD DETECTION & PREVENTION SYSTEM
 * 
 * Phase 15: Security Hardening
 * 
 * Features:
 * - Duplicate payment detection
 * - Velocity abuse detection (multiple requests in short time)
 * - Account creation spam detection
 * - Rate limiting per IP/endpoint
 * - Pattern analysis
 */

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Admin only endpoint
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { action, userId, type, details } = body;

        if (!action) {
            return NextResponse.json(
                { error: "Action is required" },
                { status: 400 }
            );
        }

        if (action === "detect") {
            // Detect fraud pattern
            const fraudData = getFraudData();
            const patterns = fraudData.filter((p) => p.userId === userId);

            return NextResponse.json(
                {
                    userId,
                    patternsFound: patterns.length,
                    severity: patterns.length > 5 ? "high" : patterns.length > 2 ? "medium" : "low",
                    patterns,
                },
                { status: 200 }
            );
        }

        if (action === "log-fraud") {
            // Log fraud pattern
            if (!userId || !type) {
                return NextResponse.json(
                    { error: "userId and type are required" },
                    { status: 400 }
                );
            }

            const fraudData = getFraudData();
            const pattern: FraudPattern = {
                userId,
                type,
                timestamp: Date.now(),
                severity:
                    type === "account_creation_spam" || type === "velocity_abuse"
                        ? "high"
                        : "medium",
                details: details || {},
            };

            fraudData.push(pattern);
            saveFraudData(fraudData);

            return NextResponse.json(
                { message: "Fraud pattern logged", pattern },
                { status: 201 }
            );
        }

        if (action === "check-rate-limit") {
            // Check rate limit for endpoint
            const { ip, endpoint, limit = 100, window = 3600 } = body;

            if (!ip || !endpoint) {
                return NextResponse.json(
                    { error: "ip and endpoint are required" },
                    { status: 400 }
                );
            }

            const rateLimitData = getRateLimitData();
            const now = Date.now();
            const key = `${ip}:${endpoint}`;

            // Clean expired entries
            const validLimits = rateLimitData.filter((r) => r.resetTime > now);

            let entry = validLimits.find((r) => r.ip === ip && r.endpoint === endpoint);

            if (!entry) {
                entry = {
                    ip,
                    endpoint,
                    count: 1,
                    resetTime: now + window * 1000,
                };
                validLimits.push(entry);
            } else {
                if (entry.count >= limit) {
                    return NextResponse.json(
                        {
                            error: "Rate limit exceeded",
                            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
                        },
                        { status: 429 }
                    );
                }
                entry.count += 1;
            }

            saveRateLimitData(validLimits);

            return NextResponse.json(
                {
                    allowed: true,
                    remaining: limit - entry.count,
                    resetTime: entry.resetTime,
                },
                { status: 200 }
            );
        }

        if (action === "get-stats") {
            // Get fraud detection statistics
            const fraudData = getFraudData();
            const rateLimitData = getRateLimitData();

            const stats = {
                totalFraudPatterns: fraudData.length,
                byType: {
                    duplicate_payment: fraudData.filter((p) => p.type === "duplicate_payment")
                        .length,
                    suspicious_login: fraudData.filter((p) => p.type === "suspicious_login")
                        .length,
                    velocity_abuse: fraudData.filter((p) => p.type === "velocity_abuse").length,
                    account_creation_spam: fraudData.filter(
                        (p) => p.type === "account_creation_spam"
                    ).length,
                },
                bySeverity: {
                    high: fraudData.filter((p) => p.severity === "high").length,
                    medium: fraudData.filter((p) => p.severity === "medium").length,
                    low: fraudData.filter((p) => p.severity === "low").length,
                },
                totalRateLimitViolations: rateLimitData.length,
                fraudPatterns: fraudData.slice(-10), // Last 10 patterns
            };

            return NextResponse.json(stats, { status: 200 });
        }

        return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Fraud detection error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Admin only endpoint
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 403 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get("action") || "stats";
        const userId = searchParams.get("userId");

        if (action === "stats") {
            const fraudData = getFraudData();
            const stats = {
                totalPatterns: fraudData.length,
                recentPatterns: fraudData.slice(-20),
            };
            return NextResponse.json(stats, { status: 200 });
        }

        if (action === "user-patterns" && userId) {
            const fraudData = getFraudData();
            const patterns = fraudData.filter((p) => p.userId === userId);
            return NextResponse.json(
                {
                    userId,
                    patterns,
                    risk: patterns.length > 5 ? "high" : patterns.length > 2 ? "medium" : "low",
                },
                { status: 200 }
            );
        }

        return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    } catch (error) {
        console.error("Fraud detection error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
