import type NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user?: {
            id: string;
            email?: string | null;
            name?: string | null;
            image?: string | null;
            roles?: string[];
            activePersona?: string;
            premiumListener?: boolean;
            verified?: boolean;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        image?: string;
        roles: string[];
        activePersona: string;
        premiumListener: boolean;
        verified: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email?: string | null;
        roles: string[];
        activePersona: string;
        premiumListener: boolean;
        verified: boolean;
    }
}
