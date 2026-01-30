/**
 * Production-safe configuration for URLs and environment
 * This file ensures all URL construction is safe during build time and runtime
 */

/**
 * Get the base URL for the application
 * Safe for use during prerender, build time, and runtime
 * 
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL (explicitly set)
 * 2. VERCEL_URL (Vercel automatic environment variable)
 * 3. NEXTAUTH_URL (NextAuth configuration)
 * 4. localhost:3000 (development fallback)
 */
export function getBaseURL(): string {
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL;
    }

    // Fallback - only in development
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3000';
    }

    // Fail loudly in production if no URL is configured
    console.error(
        'CRITICAL: No base URL configured. Set NEXT_PUBLIC_APP_URL, VERCEL_URL, or NEXTAUTH_URL'
    );
    return 'http://localhost:3000'; // Last resort fallback
}

/**
 * Construct a full URL safely
 * Never throws, always returns a valid string
 * @param path - URL path (e.g., '/api/payments/callback')
 * @returns Full URL string safe for use in redirects and API calls
 */
export function getFullURL(path: string): string {
    try {
        const base = getBaseURL();
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        // Use URL constructor only after we have a valid base
        return new URL(normalizedPath, base).toString();
    } catch (error) {
        console.error(`Failed to construct URL with path: ${path}`, error);
        return `${getBaseURL()}${path.startsWith('/') ? path : `/${path}`}`;
    }
}

/**
 * Get safe environment for checks
 */
export const config = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    baseURL: getBaseURL(),
    nextAuthSecret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
    adminEmail: process.env.ADMIN_EMAIL || 'trapkost2020@mail.com',
};
