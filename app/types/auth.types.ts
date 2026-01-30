/**
 * Authentication types and interfaces
 * Separated from utils for Turbopack compatibility
 */

import type { ExtendedUser, ExtendedSession } from "./auth";

export type UserRole = "ADMIN" | "ARTIST" | "ENTREPRENEUR" | "MARKETER" | "LISTENER";

// Re-export the types from auth.ts for backwards compatibility
export type { ExtendedUser, ExtendedSession };

