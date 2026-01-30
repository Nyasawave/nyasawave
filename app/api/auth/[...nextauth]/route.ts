import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { EMERGENCY_TEST_USERS, verifyPassword } from "@/lib/emergency-auth";

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        roles: string[];
        activePersona: string;
        premiumListener: boolean;
        verified: boolean;
    }
}

declare module "next-auth" {
    interface User {
        id: string;
        name: string;
        email: string;
        image?: string;
        roles: string[];
        activePersona: string;
        premiumListener: boolean;
        verified: boolean;
    }
}

// Dynamically resolve data path for both local and Vercel environments
function getDBPath() {
    const possiblePaths = [
        path.join(process.cwd(), "data", "users.json"),
        path.join(process.cwd(), "nyasawave", "data", "users.json"),
    ];

    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log("[NEXTAUTH] Found users.json at:", filePath);
            return filePath;
        }
    }

    console.warn("[NEXTAUTH] WARNING: users.json not found. Cwd:", process.cwd());
    return possiblePaths[0];
}

const DB = getDBPath();

// CRITICAL: Only this email can have ADMIN role (fixed from @mail.com)
const ADMIN_EMAIL = 'trapkost2020@gmail.com';

function readUsers() {
    try {
        console.log("[NEXTAUTH] Reading from:", DB);
        if (fs.existsSync(DB)) {
            const data = fs.readFileSync(DB, "utf-8");
            const users = JSON.parse(data);
            console.log("[NEXTAUTH] Loaded", users.length, "users");
            return users || [];
        }
        console.error("[NEXTAUTH] File not found:", DB);
        return [];
    } catch (e) {
        console.error("[NEXTAUTH] Error reading users:", e);
        return [];
    }
}

async function comparePasswords(
    plain: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        console.log("[NEXTAUTH] Missing email or password");
                        return null;
                    }

                    console.log("[NEXTAUTH] Authorize attempt:", credentials.email);

                    // Try to load from data/users.json first
                    const users = readUsers();
                    let user = users.find((u: any) => u.email === credentials.email);

                    // Fallback to emergency users if not found in JSON file
                    if (!user) {
                        console.log("[NEXTAUTH] User not in data/users.json, checking emergency users");
                        const emergencyUser = EMERGENCY_TEST_USERS[credentials.email];
                        if (emergencyUser) {
                            console.log("[NEXTAUTH] Found in emergency users:", credentials.email);
                            // Verify password against emergency user
                            const passwordMatch = await verifyPassword(
                                credentials.password,
                                emergencyUser.passwordHash
                            );
                            if (!passwordMatch) {
                                console.log("[NEXTAUTH] Emergency user password mismatch");
                                return null;
                            }
                            // Return emergency user formatted for NextAuth
                            return {
                                id: `emergency_${credentials.email}`,
                                email: emergencyUser.email,
                                name: credentials.email.split('@')[0],
                                roles: emergencyUser.roles,
                                activePersona: emergencyUser.activePersona,
                                premiumListener: true,
                                verified: true,
                            };
                        }
                        console.log("[NEXTAUTH] User not found in data or emergency users:", credentials.email);
                        return null;
                    }

                    console.log("[NEXTAUTH] User found:", {
                        id: user.id,
                        email: user.email,
                        roles: user.roles,
                        activePersona: user.activePersona,
                    });

                    const passwordMatch = await comparePasswords(
                        credentials.password,
                        user.password
                    );

                    if (!passwordMatch) {
                        console.log("[NEXTAUTH] Password mismatch for:", credentials.email);
                        return null;
                    }

                    console.log("[NEXTAUTH] Authorization successful for:", credentials.email);

                    // CRITICAL: Lock ADMIN role to specific email only
                    let roles = user.roles || [];
                    if (user.email !== ADMIN_EMAIL && roles.includes('ADMIN')) {
                        console.warn(`[SECURITY] Attempted admin access from ${user.email} - removing ADMIN role`);
                        roles = roles.filter((r: string) => r !== 'ADMIN');
                    }

                    // If this is the admin email and they don't have ADMIN role, add it
                    if (user.email === ADMIN_EMAIL && !roles.includes('ADMIN')) {
                        console.log(`[AUTH] Auto-granting ADMIN role to ${ADMIN_EMAIL}`);
                        roles.push('ADMIN');
                    }

                    // Return user object with multi-role support
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        roles: roles,
                        activePersona: user.activePersona || roles[0] || "LISTENER",
                        premiumListener: user.premiumListener || false,
                        verified: user.verified || false,
                    };
                } catch (error) {
                    console.error("[NEXTAUTH] Authorize error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: any }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.roles = user.roles || [];
                token.activePersona = user.activePersona || "LISTENER";
                token.premiumListener = user.premiumListener || false;
                token.verified = user.verified || false;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.roles = token.roles as string[];
                session.user.activePersona = token.activePersona as string;
                session.user.premiumListener = token.premiumListener as boolean;
                session.user.verified = token.verified as boolean;
            }
            return session;
        },
    },
    pages: {
        signIn: "/signin",
        error: "/signin",
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
