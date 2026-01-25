/**
 * Authentication types and interfaces
 * Separated from utils for Turbopack compatibility
 */

import { Session } from "next-auth";

export type UserRole = "ADMIN" | "ARTIST" | "ENTREPRENEUR" | "MARKETER" | "LISTENER";

export interface AuthUser extends Session["user"] {
    id: string;
    email?: string;
    name?: string;
    roles: UserRole[];
    activePersona: UserRole;
    premiumListener: boolean;
    verified: boolean;
}
