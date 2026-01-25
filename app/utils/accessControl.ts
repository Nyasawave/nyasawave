/**
 * ACCESS CONTROL SERVICE
 * 
 * Enforces NyasaWave's complex permission rules:
 * 1. Is user logged in?
 * 2. Is this a tournament song?
 * 3. Does user have premium status?
 * 4. Does user's role allow this action?
 * 
 * Non-logged users: Can ONLY listen, like, share TOURNAMENT songs
 * Logged-in users: Role + premium status determine access
 * Artists/Entrepreneurs/Marketers: Must have premium to download
 * Admin: Always has premium access
 */

import { Session } from "next-auth";

export type AccessLevel = "PUBLIC" | "TOURNAMENT_ONLY" | "LOGIN_REQUIRED" | "PREMIUM_REQUIRED" | "ROLE_REQUIRED" | "ADMIN_ONLY";

export interface AccessCheckParams {
    user: Session["user"] | undefined;
    action: "listen" | "like" | "share" | "comment" | "download" | "join_tournament" | "list_marketplace" | "create_campaign";
    resourceType?: "song" | "tournament" | "marketplace_item" | "campaign";
    isTournament?: boolean;
    resourceOwnerId?: string;
}

export interface AccessResult {
    allowed: boolean;
    reason?: string;
    requiredCondition?: AccessLevel;
    suggestedAction?: "signin" | "upgrade_premium" | "insufficient_role";
}

/**
 * CHECK ACCESS - Main access control function
 * 
 * Usage:
 * const access = checkAccess({
 *   user: session.user,
 *   action: "download",
 *   resourceType: "song",
 *   isTournament: false
 * });
 * 
 * if (!access.allowed) {
 *   if (access.suggestedAction === "signin") redirect("/signin");
 *   if (access.suggestedAction === "upgrade_premium") redirect("/subscribe");
 * }
 */
export function checkAccess(params: AccessCheckParams): AccessResult {
    const { user, action, resourceType, isTournament, resourceOwnerId } = params;
    const isLoggedIn = !!user?.id;
    const isAdmin = user?.roles?.includes("ADMIN");
    const isPremium = user?.premiumListener || isAdmin; // Admin always premium
    const isArtist = user?.roles?.includes("ARTIST");
    const isEntrepreneur = user?.roles?.includes("ENTREPRENEUR");
    const isMarketer = user?.roles?.includes("MARKETER");

    // ============================================
    // ACTION: LISTEN
    // ============================================
    if (action === "listen") {
        // Non-logged: Can listen ONLY to tournament songs
        if (!isLoggedIn) {
            if (isTournament) {
                return { allowed: true };
            }
            return {
                allowed: false,
                reason: "Only tournament songs available to non-logged users",
                requiredCondition: "TOURNAMENT_ONLY",
                suggestedAction: "signin",
            };
        }
        // Logged-in: Can listen to all songs
        return { allowed: true };
    }

    // ============================================
    // ACTION: LIKE
    // ============================================
    if (action === "like") {
        // Non-logged: Can like ONLY tournament songs
        if (!isLoggedIn) {
            if (isTournament) {
                return { allowed: true };
            }
            return {
                allowed: false,
                reason: "Only tournament songs available to non-logged users",
                requiredCondition: "TOURNAMENT_ONLY",
                suggestedAction: "signin",
            };
        }
        // Logged-in: Can like all songs
        return { allowed: true };
    }

    // ============================================
    // ACTION: SHARE
    // ============================================
    if (action === "share") {
        // Non-logged: Can share ONLY tournament songs
        if (!isLoggedIn) {
            if (isTournament) {
                return { allowed: true };
            }
            return {
                allowed: false,
                reason: "Only tournament songs available to non-logged users",
                requiredCondition: "TOURNAMENT_ONLY",
                suggestedAction: "signin",
            };
        }
        // Logged-in: Can share all songs
        return { allowed: true };
    }

    // ============================================
    // ACTION: COMMENT
    // ============================================
    if (action === "comment") {
        // Non-logged users CANNOT comment
        if (!isLoggedIn) {
            return {
                allowed: false,
                reason: "Must be logged in to comment",
                requiredCondition: "LOGIN_REQUIRED",
                suggestedAction: "signin",
            };
        }
        // Logged-in users can comment
        return { allowed: true };
    }

    // ============================================
    // ACTION: DOWNLOAD
    // ============================================
    if (action === "download") {
        // Non-logged users CANNOT download
        if (!isLoggedIn) {
            return {
                allowed: false,
                reason: "Must be logged in to download",
                requiredCondition: "LOGIN_REQUIRED",
                suggestedAction: "signin",
            };
        }

        // Logged-in users need PREMIUM to download
        // Exception: ADMIN and ARTIST downloading their own songs
        const isOwnSong = resourceOwnerId === user?.id;
        const canDownloadAsArtist = isArtist && isOwnSong;

        if (!isPremium && !canDownloadAsArtist) {
            return {
                allowed: false,
                reason: "Premium subscription required to download",
                requiredCondition: "PREMIUM_REQUIRED",
                suggestedAction: "upgrade_premium",
            };
        }

        return { allowed: true };
    }

    // ============================================
    // ACTION: JOIN_TOURNAMENT
    // ============================================
    if (action === "join_tournament") {
        // Non-logged users CANNOT join tournaments
        if (!isLoggedIn) {
            return {
                allowed: false,
                reason: "Must be logged in to join tournaments",
                requiredCondition: "LOGIN_REQUIRED",
                suggestedAction: "signin",
            };
        }

        // Only ARTIST role can join tournaments
        if (!isArtist && !isAdmin) {
            return {
                allowed: false,
                reason: "Only artists can join tournaments",
                requiredCondition: "ROLE_REQUIRED",
                suggestedAction: "insufficient_role",
            };
        }

        // Artists need to pay entry fee (handled in checkout)
        return { allowed: true };
    }

    // ============================================
    // ACTION: LIST_MARKETPLACE
    // ============================================
    if (action === "list_marketplace") {
        // Non-logged users CANNOT list
        if (!isLoggedIn) {
            return {
                allowed: false,
                reason: "Must be logged in to list on marketplace",
                requiredCondition: "LOGIN_REQUIRED",
                suggestedAction: "signin",
            };
        }

        // Only ENTREPRENEUR role can list
        if (!isEntrepreneur && !isAdmin) {
            return {
                allowed: false,
                reason: "Only entrepreneurs can list on marketplace",
                requiredCondition: "ROLE_REQUIRED",
                suggestedAction: "insufficient_role",
            };
        }

        // Must be verified to list
        if (!user?.verified) {
            return {
                allowed: false,
                reason: "Identity verification required to list on marketplace",
                requiredCondition: "LOGIN_REQUIRED",
                suggestedAction: "signin", // Redirect to verify page
            };
        }

        // Must pay listing fee (handled in checkout)
        return { allowed: true };
    }

    // ============================================
    // ACTION: CREATE_CAMPAIGN
    // ============================================
    if (action === "create_campaign") {
        // Non-logged users CANNOT create campaigns
        if (!isLoggedIn) {
            return {
                allowed: false,
                reason: "Must be logged in to create campaigns",
                requiredCondition: "LOGIN_REQUIRED",
                suggestedAction: "signin",
            };
        }

        // Only MARKETER role can create campaigns
        if (!isMarketer && !isAdmin) {
            return {
                allowed: false,
                reason: "Only marketers can create campaigns",
                requiredCondition: "ROLE_REQUIRED",
                suggestedAction: "insufficient_role",
            };
        }

        return { allowed: true };
    }

    // ============================================
    // DEFAULT
    // ============================================
    return {
        allowed: false,
        reason: `Unknown action: ${action}`,
    };
}

/**
 * CHECK MULTIPLE ACCESSES - Useful for permission checking
 * Returns true if user has ANY of the accesses
 */
export function hasAnyAccess(
    user: Session["user"] | undefined,
    actions: AccessCheckParams[]
): boolean {
    return actions.some(action => checkAccess({ user, ...action }).allowed);
}

/**
 * CHECK ALL ACCESSES - Useful for permission checking
 * Returns true if user has ALL accesses
 */
export function hasAllAccesses(
    user: Session["user"] | undefined,
    actions: AccessCheckParams[]
): boolean {
    return actions.every(action => checkAccess({ user, ...action }).allowed);
}

/**
 * GET ACCESS LEVEL - Returns the required access level for an action
 */
export function getAccessLevel(params: AccessCheckParams): AccessLevel {
    const result = checkAccess(params);

    if (result.allowed) {
        return "PUBLIC";
    }

    return result.requiredCondition || "PUBLIC";
}

/**
 * FORMAT ACCESS DENIAL MESSAGE - User-friendly error messages
 */
export function formatAccessDenial(result: AccessResult): string {
    if (result.allowed) {
        return "";
    }

    const messages: Record<AccessLevel, string> = {
        PUBLIC: "This action is public",
        TOURNAMENT_ONLY: "Only tournament content is available to non-logged users",
        LOGIN_REQUIRED: "You must log in to perform this action",
        PREMIUM_REQUIRED: "Premium subscription required for this action",
        ROLE_REQUIRED: "Your role does not have permission for this action",
        ADMIN_ONLY: "This action is restricted to administrators",
    };

    return result.reason || messages[result.requiredCondition || "PUBLIC"];
}
