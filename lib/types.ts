/**
 * User Types & Role-Based Access Control
 * Defines 6 user types with granular permissions
 */

export type UserRole = 'ADMIN' | 'ARTIST' | 'USER';

/**
 * The 6 user types in NyasaWave:
 * 1. Visitor - Unauthenticated, read-only access
 * 2. User - Basic authenticated fan account
 * 3. SubscribedUser - Premium fan with extended features
 * 4. Artist - Music uploader, can boost tracks
 * 5. SubscribedArtist - Premium artist with ads + analytics
 * 6. Admin - Platform administrator
 */

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole; // ADMIN | ARTIST | USER
    subscribed?: boolean; // backward compatibility
    subscription?: {
        tier: 'free' | 'premium'; // free=basic, premium=subscribed
        status: 'active' | 'canceled' | 'expired';
        expiresAt?: Date;
    };
    artist?: {
        verified: boolean;
        earnings: number;
        followers: number;
    };
    createdAt: Date;
    banned?: boolean;
    bannedReason?: string;
}

/**
 * User type classifier based on role + subscription
 */
export type UserType =
    | 'visitor'
    | 'user'
    | 'subscribed_user'
    | 'artist'
    | 'subscribed_artist'
    | 'admin';

/**
 * Get user type from user object
 */
export function getUserType(user: User | null): UserType {
    if (!user) return 'visitor';
    if (user.role === 'ADMIN') return 'admin';
    if (user.role === 'ARTIST') {
        return user.subscription?.tier === 'premium' ? 'subscribed_artist' : 'artist';
    }
    return user.subscription?.tier === 'premium' ? 'subscribed_user' : 'user';
}

/**
 * Permission definitions for each user type
 */
export const PERMISSIONS: Record<UserType, Record<string, boolean>> = {
    visitor: {
        view_discover: true,
        view_artists: true,
        view_tracks: true,
        view_playlists: true,
        play_preview: true,
        // Cannot play full tracks, upload, boost, create ads
    },
    user: {
        view_discover: true,
        view_artists: true,
        view_tracks: true,
        view_playlists: true,
        play_full_track: true,
        create_playlist: true,
        like_track: true,
        follow_artist: true,
        // Cannot upload, boost, create ads, access artist dashboard
    },
    subscribed_user: {
        view_discover: true,
        view_artists: true,
        view_tracks: true,
        view_playlists: true,
        play_full_track: true,
        create_playlist: true,
        like_track: true,
        follow_artist: true,
        offline_download: true,
        ad_free: true,
        exclusive_content: true,
        // Still cannot upload, boost, create ads
    },
    artist: {
        view_discover: true,
        view_artists: true,
        view_tracks: true,
        view_playlists: true,
        play_full_track: true,
        create_playlist: true,
        like_track: true,
        follow_artist: true,
        upload_track: true,
        view_analytics: true,
        boost_track: true, // Limited boosts
        withdraw_earnings: true,
        access_artist_dashboard: true,
        // Cannot create ads, access admin panel
    },
    subscribed_artist: {
        view_discover: true,
        view_artists: true,
        view_tracks: true,
        view_playlists: true,
        play_full_track: true,
        create_playlist: true,
        like_track: true,
        follow_artist: true,
        upload_track: true,
        view_analytics: true,
        boost_track: true, // Unlimited boosts
        create_ad: true,
        manage_ads: true,
        withdraw_earnings: true,
        access_artist_dashboard: true,
        priority_support: true,
        // Cannot access admin panel
    },
    admin: {
        // Admin has all permissions
        view_discover: true,
        view_artists: true,
        view_tracks: true,
        view_playlists: true,
        play_full_track: true,
        create_playlist: true,
        like_track: true,
        follow_artist: true,
        upload_track: true,
        view_analytics: true,
        boost_track: true,
        create_ad: true,
        manage_ads: true,
        withdraw_earnings: true,
        access_artist_dashboard: true,
        priority_support: true,
        access_admin_panel: true,
        manage_users: true,
        manage_artists: true,
        view_audit_logs: true,
        manage_reports: true,
    },
};

/**
 * Routes and required user types/permissions
 */
export const ROUTE_ACCESS: Record<
    string,
    {
        requiredTypes?: UserType[];
        requiredPermissions?: string[];
        requiresAuth: boolean;
    }
> = {
    // Public routes
    '/': { requiresAuth: false },
    '/discover': { requiresAuth: false },
    '/artists': { requiresAuth: false },
    '/pricing': { requiresAuth: false },
    '/business': { requiresAuth: false },
    '/investors': { requiresAuth: false },

    // Auth required routes
    '/signin': { requiresAuth: false },
    '/register': { requiresAuth: false },
    '/forgot': { requiresAuth: false },

    // Fan/User routes
    '/playlists': { requiresAuth: true, requiredPermissions: ['create_playlist'] },
    '/subscribe': { requiresAuth: true },
    '/payment/checkout': { requiresAuth: true },

    // Artist routes
    '/artist/register': { requiresAuth: false },
    '/artist/signin': { requiresAuth: false },
    '/artist/dashboard': {
        requiresAuth: true,
        requiredTypes: ['artist', 'subscribed_artist'],
    },
    '/artist/upload': {
        requiresAuth: true,
        requiredTypes: ['artist', 'subscribed_artist'],
    },
    '/artist/analytics': {
        requiresAuth: true,
        requiredTypes: ['artist', 'subscribed_artist'],
    },
    '/artist/earnings': {
        requiresAuth: true,
        requiredTypes: ['artist', 'subscribed_artist'],
    },
    '/artist/ads': {
        requiresAuth: true,
        requiredTypes: ['subscribed_artist'],
    },
    '/artist/checkout': {
        requiresAuth: true,
        requiredTypes: ['artist', 'subscribed_artist'],
    },

    // Admin routes
    '/admin': { requiresAuth: true, requiredTypes: ['admin'] },
    '/admin/users': { requiresAuth: true, requiredTypes: ['admin'] },
    '/admin/artists': { requiresAuth: true, requiredTypes: ['admin'] },

    // Marketplace
    '/marketplace': { requiresAuth: false },
};

/**
 * Check if user has permission
 */
export function canAccess(user: User | null, permission: string): boolean {
    const userType = getUserType(user);
    return PERMISSIONS[userType]?.[permission] ?? false;
}

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
    return user?.role === role;
}

/**
 * Check if user is of specific type
 */
export function isUserType(user: User | null, types: UserType | UserType[]): boolean {
    const userType = getUserType(user);
    if (Array.isArray(types)) {
        return types.includes(userType);
    }
    return userType === types;
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(
    user: User | null,
    route: string
): { allowed: boolean; reason?: string } {
    const access = ROUTE_ACCESS[route];
    if (!access) return { allowed: true }; // Unknown route, allow by default

    if (access.requiresAuth && !user) {
        return {
            allowed: false,
            reason: 'Authentication required',
        };
    }

    if (access.requiredTypes && user) {
        const userType = getUserType(user);
        if (!access.requiredTypes.includes(userType)) {
            return {
                allowed: false,
                reason: `Access denied. Required: ${access.requiredTypes.join(' or ')}, Got: ${userType}`,
            };
        }
    }

    if (access.requiredPermissions && user) {
        const hasAllPermissions = access.requiredPermissions.every((perm) =>
            canAccess(user, perm)
        );
        if (!hasAllPermissions) {
            return {
                allowed: false,
                reason: 'Insufficient permissions',
            };
        }
    }

    return { allowed: true };
}
