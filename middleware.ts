import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * COMPREHENSIVE MIDDLEWARE FOR NYASAWAVE
 * 
 * Handles:
 * 1. Role-based route protection (server-side)
 * 2. Session verification via NextAuth
 * 3. ADMIN email locking (trapkost2020@mail.com ONLY)
 * 4. Automatic redirects for unauthorized access
 * 
 * CRITICAL SECURITY RULES:
 * - ADMIN role ONLY for trapkost2020@mail.com
 * - No other email can access /admin/* routes
 * - Middleware is first line of defense
 */

const ADMIN_EMAIL = 'trapkost2020@mail.com';

const ROLE_BASED_ROUTES: Record<string, string[]> = {
    '/artist': ['ARTIST', 'ADMIN'],
    '/entrepreneur': ['ENTREPRENEUR', 'ADMIN'],
    '/marketer': ['MARKETER', 'ADMIN'],
    '/listener': ['LISTENER', 'ARTIST', 'ENTREPRENEUR', 'MARKETER', 'ADMIN'],
    '/admin': ['ADMIN'],
    '/payments': ['LISTENER', 'ARTIST', 'ENTREPRENEUR', 'MARKETER', 'ADMIN'],
    '/checkout': ['LISTENER', 'ARTIST', 'ENTREPRENEUR', 'MARKETER', 'ADMIN'],
    '/marketplace': ['LISTENER', 'ARTIST', 'ENTREPRENEUR', 'MARKETER', 'ADMIN'],
    '/tournaments': ['LISTENER', 'ARTIST', 'ENTREPRENEUR', 'MARKETER', 'ADMIN'],
    '/me': ['LISTENER', 'ARTIST', 'ENTREPRENEUR', 'MARKETER', 'ADMIN'],
    '/upload': ['ARTIST', 'ADMIN'],
    '/subscribe': ['LISTENER', 'ARTIST', 'ENTREPRENEUR', 'MARKETER', 'ADMIN'],
    '/playlists': ['LISTENER', 'ARTIST', 'ENTREPRENEUR', 'MARKETER', 'ADMIN'],
    '/analytics': ['ARTIST', 'ENTREPRENEUR', 'MARKETER', 'ADMIN'],
    '/account/settings': ['LISTENER', 'ARTIST', 'ENTREPRENEUR', 'MARKETER', 'ADMIN'],
    '/notifications': ['LISTENER', 'ARTIST', 'ENTREPRENEUR', 'MARKETER', 'ADMIN'],
    '/admin/moderation': ['ADMIN'],
    '/admin/payments': ['ADMIN'],
    '/admin/entrepreneurs': ['ADMIN'],
    '/admin/marketers': ['ADMIN'],
    '/artist/tracks': ['ARTIST', 'ADMIN'],
    '/artist/dashboard': ['ARTIST', 'ADMIN'],
};

const PUBLIC_ROUTES = [
    '/',
    '/discover',
    '/pricing',
    '/investors',
    '/business',
    '/signin',
    '/login',
    '/register',
    '/forgot',
    '/terms',
    '/privacy',
    '/refund',
    '/artists',
    '/community-guidelines',
    '/copyright',
    '/seller-agreement',
];

const NEVER_REDIRECT_ROUTES = [
    '/signin',
    '/login',
    '/register',
    '/forgot',
    '/auth',
];

async function getSessionToken(request: NextRequest) {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            console.warn('[MIDDLEWARE] NEXTAUTH_SECRET is not set - session verification will fail');
            return null;
        }
        const token = await getToken({ req: request, secret });
        return token;
    } catch (error) {
        console.error('[MIDDLEWARE] Token verification failed:', error);
        return null;
    }
}

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );
}

function shouldNeverRedirect(pathname: string): boolean {
    return NEVER_REDIRECT_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );
}

function getRequiredRoles(pathname: string): string[] | null {
    for (const [route, roles] of Object.entries(ROLE_BASED_ROUTES)) {
        if (pathname === route || pathname.startsWith(route + '/')) {
            return roles;
        }
    }
    return null;
}

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Auth pages never redirect
    if (shouldNeverRedirect(pathname)) {
        return NextResponse.next();
    }

    // Public routes need no auth
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // Check role-based routes
    const requiredRoles = getRequiredRoles(pathname);
    if (!requiredRoles) {
        return NextResponse.next();
    }

    // Get session token
    const token = await getSessionToken(req);
    if (!token) {
        const signinUrl = new URL('/signin', req.url);
        signinUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signinUrl);
    }

    // CRITICAL: Lock /admin/* to trapkost2020@mail.com ONLY
    if (pathname.startsWith('/admin')) {
        if (token.email !== ADMIN_EMAIL) {
            console.warn(`[SECURITY] Unauthorized admin access attempt from ${token.email}`);
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // Check if user has required role
    const userRoles = (token.roles as string[]) || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
        console.warn(`[MIDDLEWARE] Access denied - ${token.email} lacks required roles for ${pathname}`);
        return NextResponse.redirect(new URL('/', req.url));
    }

    console.log(`[MIDDLEWARE] Access granted - ${token.email} (${userRoles.join(',')}) -> ${pathname}`);
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
