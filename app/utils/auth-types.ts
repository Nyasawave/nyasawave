/**
 * Authentication Types - Separate file for type definitions
 * Re-exports from app/types/auth.ts for backwards compatibility
 */

export type { ExtendedUser, ExtendedSession } from "@/app/types/auth";

export type UserRole = "ADMIN" | "ARTIST" | "ENTREPRENEUR" | "MARKETER" | "LISTENER";

