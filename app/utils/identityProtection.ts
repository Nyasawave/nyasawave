/**
 * Identity Protection Utilities
 * Ensures admin identity is never exposed publicly
 */

import type { ExtendedUser } from "@/app/types/auth";

/**
 * Get public roles (hide admin identity)
 * Admin users should only show their non-admin roles publicly
 */
export function getPublicRoles(user: ExtendedUser | undefined): string[] {
    if (!user?.roles) return ["LISTENER"];

    // Filter out ADMIN role from public view
    const publicRoles = user.roles.filter(role => role !== "ADMIN");

    // If user only has ADMIN role, show as LISTENER publicly
    if (publicRoles.length === 0) {
        return ["LISTENER"];
    }

    return publicRoles;
}

/**
 * Hide admin identity from public profile
 * Returns user object with ADMIN role removed
 */
export function hideAdminIdentity(user: ExtendedUser | undefined): ExtendedUser | undefined {
    if (!user) return undefined;

    return {
        ...user,
        roles: getPublicRoles(user),
        activePersona: user.activePersona === "ADMIN" ? "LISTENER" : user.activePersona,
    };
}

/**
 * Check if admin is acting as different role
 * Used internally to determine identity mode
 */
export function isAdminActingAs(user: ExtendedUser | undefined, role: string): boolean {
    if (!user || !user.roles) return false;

    const isAdmin = user.roles.includes("ADMIN");
    const isCurrentRoleAdmin = user.activePersona === "ADMIN" || role === "ADMIN";

    return isAdmin && !isCurrentRoleAdmin;
}

/**
 * Get real internal roles (admin only - never expose publicly)
 * Used server-side for actual permission checking
 */
export function getRealRoles(user: ExtendedUser | undefined): string[] {
    if (!user || !user.roles) return ["LISTENER"];
    return user.roles;
}

/**
 * Validate role is in user's available roles
 */
export function isValidRole(user: ExtendedUser | undefined, role: string): boolean {
    if (!user || !user.roles) return false;
    return user.roles.includes(role as any);
}
