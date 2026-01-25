"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";

/**
 * HYDRATION-SAFE PROTECTED PAGE WRAPPER
 * 
 * Prevents redirect loops by:
 * 1. Waiting for NextAuth session to load completely
 * 2. Only then checking user role
 * 3. Showing loading spinner during auth verification
 * 4. Gracefully handling session failures
 * 
 * Usage:
 * ```tsx
 * export default function ProtectedPage() {
 *   return (
 *     <ProtectedPageWrapper requiredRoles={['ARTIST', 'ADMIN']}>
 *       <YourPageContent />
 *     </ProtectedPageWrapper>
 *   );
 * }
 * ```
 */

interface ProtectedPageWrapperProps {
    requiredRoles: string[];
    children: React.ReactNode;
    fallbackUrl?: string;
    loadingComponent?: React.ReactNode;
}

export function ProtectedPageWrapper({
    requiredRoles,
    children,
    fallbackUrl = "/signin",
    loadingComponent,
}: ProtectedPageWrapperProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // 1. WAIT FOR SESSION TO LOAD
        if (status === "loading") {
            return; // Still loading, don't do anything
        }

        // 2. SESSION LOADED - Now check authorization
        if (status === "unauthenticated" || !session?.user) {
            console.log(`[AUTH] Unauthenticated access attempt, redirecting to ${fallbackUrl}`);
            router.push(fallbackUrl);
            return;
        }

        // 3. CHECK ROLE - Check if user has any of the required roles
        const userRoles = session.user.roles || [];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
        
        if (!hasRequiredRole) {
            console.log(
                `[AUTH] Unauthorized roles ${userRoles.join(',')} for protected page, redirecting to ${fallbackUrl}`
            );
            router.push(fallbackUrl);
            return;
        }

        // 4. AUTHORIZED - Show content
        console.log(`[AUTH] Authorized - roles ${userRoles.join(',')} granted access`);
        setIsAuthorized(true);
    }, [status, session, router, requiredRoles, fallbackUrl]);

    // SHOW LOADING WHILE SESSION IS LOADING
    if (status === "loading") {
        return loadingComponent || <DefaultLoadingScreen />;
    }

    // NOT AUTHORIZED - SHOW ERROR (will redirect shortly)
    if (!isAuthorized) {
        return <DefaultLoadingScreen message="Verifying access..." />;
    }

    // AUTHORIZED - SHOW CONTENT
    return <>{children}</>;
}

/**
 * Default loading screen shown while auth is verifying
 */
function DefaultLoadingScreen({ message = "Loading..." }: { message?: string }) {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
            <div className="text-center">
                <div className="mb-6 inline-block">
                    <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-zinc-400 text-lg">{message}</p>
                <p className="text-zinc-600 text-sm mt-4">
                    {message === "Loading..." && "Checking your permissions..."}
                </p>
            </div>
        </main>
    );
}

/**
 * HYDRATION GUARD HOOK - Use in pages directly
 * 
 * Returns: { isLoading, isAuthorized, userRole }
 * 
 * Example:
 * ```tsx
 * const { isLoading, isAuthorized, userRole } = useProtectedPage(['ARTIST']);
 * 
 * if (isLoading) return <LoadingSpinner />;
 * if (!isAuthorized) return <AccessDenied />;
 * 
 * return <DashboardContent userRole={userRole} />;
 * ```
 */
export function useProtectedPage(requiredRoles: string[]) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Still loading session
        if (status === "loading") {
            return;
        }

        // Session loaded - check auth
        if (status === "unauthenticated" || !session?.user) {
            console.log("[AUTH] Session check failed, redirecting to signin");
            router.push("/signin");
            setHasChecked(true);
            return;
        }

        // Check role
        const userRoles = session.user.roles || [];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
        
        if (!hasRequiredRole) {
            console.log(`[AUTH] Roles ${userRoles.join(',')} not authorized, redirecting`);
            // Don't redirect yet - let caller handle it
        }

        setIsAuthorized(hasRequiredRole);
        setHasChecked(true);
    }, [status, session, router, requiredRoles]);

    return {
        isLoading: status === "loading" || !hasChecked,
        isAuthorized,
        activePersona: session?.user?.activePersona || "",
        roles: session?.user?.roles || [],
        user: session?.user,
    };
}
