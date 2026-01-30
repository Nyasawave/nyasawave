import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            roles: string[];
            activePersona: string;
            premiumListener: boolean;
            verified: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        roles: string[];
        activePersona: string;
        premiumListener: boolean;
        verified: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        roles: string[];
        activePersona: string;
        premiumListener: boolean;
        verified: boolean;
    }
}
