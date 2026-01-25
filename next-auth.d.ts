import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email?: string;
            name?: string;
            image?: string;
            roles: string[];
            activePersona: string;
            premiumListener: boolean;
            verified: boolean;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
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
