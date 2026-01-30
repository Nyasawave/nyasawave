/**
 * Authentication utilities for multi-role, multi-persona system
 */

import { Session } from "next-auth";
import type { ExtendedUser } from "@/app/types/auth";
import { UserRole } from "./auth-types";

/**
 * Check if user has at least one of the required roles
 */
export function hasRole(user: ExtendedUser | undefined, ...roles: UserRole[]): boolean {
    if (!user?.roles || user.roles.length === 0) return false;
    return roles.some(role => user.roles!.includes(role));
}

/**
 * Check if user has all of the required roles
 */
export function hasAllRoles(user: ExtendedUser | undefined, ...roles: UserRole[]): boolean {
    if (!user?.roles || user.roles.length === 0) return false;
    return roles.every(role => user.roles!.includes(role));
}

/**
 * Check if user is verified (identity verification passed)
 */
export function isVerified(user: ExtendedUser | undefined): boolean {
    return !!user?.verified;
}

/**
 * Check if user has premium listener status
 */
export function isPremiumListener(user: ExtendedUser | undefined): boolean {
    return !!user?.premiumListener;
}

/**
 * Check if user is an artist
 */
export function isArtist(user: ExtendedUser | undefined): boolean {
    return hasRole(user, "ARTIST");
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: ExtendedUser | undefined): boolean {
    return hasRole(user, "ADMIN");
}

/**
 * Check if user is an entrepreneur (runs a business on marketplace)
 */
export function isEntrepreneur(user: ExtendedUser | undefined): boolean {
    return hasRole(user, "ENTREPRENEUR");
}

/**
 * Check if user is a marketer
 */
export function isMarketer(user: ExtendedUser | undefined): boolean {
    return hasRole(user, "MARKETER");
}

/**
 * Get all roles excluding LISTENER (to find "main" role)
 */
export function getMainRole(user: ExtendedUser | undefined): UserRole | null {
    if (!user?.roles) return null;
    const mainRoles = user.roles.filter(r => r !== "LISTENER");
    return mainRoles.length > 0 ? (mainRoles[0] as UserRole) : ("LISTENER" as UserRole);
}

/**
 * Check if user can switch to a specific persona
 */
export function canSwitchToPersona(user: ExtendedUser | undefined, persona: UserRole): boolean {
    if (!user?.roles) return false;
    return user.roles.includes(persona);
}

/**
 * Check if user has access to a route based on their roles
 */
export function hasAccessToRoute(user: ExtendedUser | undefined, requiredRoles: UserRole[]): boolean {
    if (!user?.roles) return false;
    return requiredRoles.some(role => user.roles!.includes(role));
}

/**
 * Check if user can access premium features
 */
export function canAccessPremiumFeatures(user: ExtendedUser | undefined): boolean {
    return isPremiumListener(user) || isArtist(user) || isAdmin(user);
}

/**
 * Format role for display
 */
export function formatRole(role: UserRole): string {
    const roleMap: Record<UserRole, string> = {
        ADMIN: "Administrator",
        ARTIST: "Artist",
        ENTREPRENEUR: "Entrepreneur",
        MARKETER: "Marketer",
        LISTENER: "Listener",
    };
    return roleMap[role] || role;
}

/**
 * Get role description for UI
 */
export function getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
        ADMIN: "Manage platform, users, and system settings",
        ARTIST: "Upload tracks, manage releases, view analytics",
        ENTREPRENEUR: "Run business on marketplace, manage listings",
        MARKETER: "Create marketing campaigns and promotions",
        LISTENER: "Listen to music, create playlists, discover tracks",
    };
    return descriptions[role] || "User role";
}

/**
 * Check if user should see the persona switcher
 */
export function shouldShowPersonaSwitcher(user: ExtendedUser | undefined): boolean {
    if (!user?.roles) return false;
    // Show if user has more than one role
    return user.roles.length > 1;
}
/**
 * Check if user is the hidden admin
 * SECURITY: Admin email must never be exposed in UI/profile pages
 * This function helps filter admin-specific content
 */
export function isHiddenAdmin(user: ExtendedUser | undefined): boolean {
    if (!user?.email) return false;
    // Check if user is ADMIN and has the special admin email
    return isAdmin(user) && user.email === "trapkost2020@gmail.com";
}

/**
 * Get display name for user (with hidden admin protection)
 * Returns generic name for hidden admin to prevent email exposure
 */
export function getDisplayName(user: ExtendedUser | undefined): string {
    if (!user) return "User";
    if (isHiddenAdmin(user)) {
        return "Administrator"; // Hide actual name/email
    }
    return user.name || user.email || "User";
}

// Re-export types for backward compatibility
export type { ExtendedUser } from "@/app/types/auth";
export type { UserRole } from "./auth-types";
