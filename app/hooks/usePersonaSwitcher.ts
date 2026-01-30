import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import type { ExtendedSession } from "@/app/types/auth";
import type { UserRole } from "@/app/utils/auth";

export function usePersonaSwitcher() {
    const { data: session, update } = useSession() as { data: ExtendedSession | null; update: (data?: any) => Promise<ExtendedSession | null> };
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const switchPersona = useCallback(
        async (newPersona: UserRole) => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch("/api/auth/switch-persona", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ persona: newPersona }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Failed to switch persona");
                }

                // Refresh session
                await update();

                return true;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Unknown error";
                setError(message);
                console.error("Persona switch error:", err);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [update]
    );

    const canSwitchTo = useCallback(
        (persona: UserRole): boolean => {
            if (!session?.user?.roles) return false;
            return session.user.roles.includes(persona);
        },
        [session?.user]
    );

    return {
        currentPersona: session?.user?.activePersona as UserRole | undefined,
        roles: session?.user?.roles as UserRole[] | undefined,
        isLoading,
        error,
        switchPersona,
        canSwitchTo,
        hasManyRoles: (session?.user?.roles?.length ?? 0) > 1,
    };
}
