import type { Session } from "next-auth";

export interface ExtendedUser {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    roles?: string[];
    activePersona?: string;
    premiumListener?: boolean;
    verified?: boolean;
}

export interface ExtendedSession extends Session {
    user?: ExtendedUser;
}
