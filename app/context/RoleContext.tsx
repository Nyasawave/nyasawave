'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { UserRole } from '@/app/utils/auth-types';

interface RoleContextType {
    activeRole: UserRole;
    availableRoles: UserRole[];
    switchRole: (role: UserRole) => Promise<void>;
    canSwitchTo: (role: UserRole) => boolean;
    isLoading: boolean;
    error: string | null;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export { RoleContext };

export function RoleContextProvider({
    children,
    initialRole,
    availableRoles
}: {
    children: React.ReactNode;
    initialRole: UserRole;
    availableRoles: UserRole[];
}) {
    const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Verify role is valid on mount
    useEffect(() => {
        if (!availableRoles.includes(activeRole)) {
            const validRole = availableRoles[0];
            setActiveRole(validRole);
            localStorage.setItem('activeRole', validRole);
        }
    }, [activeRole, availableRoles]);

    const switchRole = useCallback(async (newRole: UserRole) => {
        if (!availableRoles.includes(newRole)) {
            setError('Invalid role');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Call backend to switch role
            const response = await fetch('/api/auth/switch-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                throw new Error('Failed to switch role');
            }

            const data = await response.json();

            // Update active role
            setActiveRole(newRole);
            localStorage.setItem('activeRole', newRole);

            // Optional: Redirect based on new role
            const roleRoutes: Record<UserRole, string> = {
                ADMIN: '/admin',
                ARTIST: '/artist',
                LISTENER: '/discover',
                ENTREPRENEUR: '/marketplace',
                MARKETER: '/marketer',
            };

            // Could redirect here if desired
            // window.location.href = roleRoutes[newRole];
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, [availableRoles]);

    const canSwitchTo = useCallback((role: UserRole) => {
        return availableRoles.includes(role) && role !== activeRole;
    }, [availableRoles, activeRole]);

    return (
        <RoleContext.Provider
            value={{
                activeRole,
                availableRoles,
                switchRole,
                canSwitchTo,
                isLoading,
                error
            }}
        >
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const context = useContext(RoleContext);

    if (context === undefined) {
        throw new Error('useRole must be used within RoleContextProvider');
    }

    return {
        ...context,
        isAdmin: context.activeRole === 'ADMIN',
        isArtist: context.activeRole === 'ARTIST',
        isListener: context.activeRole === 'LISTENER',
        isEntrepreneur: context.activeRole === 'ENTREPRENEUR',
        isMarketer: context.activeRole === 'MARKETER',
    };
}

/**
 * RoleProvider wrapper for easy use in layouts
 * Automatically gets initial role from session
 */
export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [initialRole, setInitialRole] = React.useState<UserRole>('LISTENER');
    const [availableRoles, setAvailableRoles] = React.useState<UserRole[]>(['LISTENER']);

    React.useEffect(() => {
        // Get roles from session (client-side)
        const getRolesFromSession = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setInitialRole(data.activePersona || 'LISTENER');
                    setAvailableRoles(data.roles || ['LISTENER']);
                } else {
                    // Not logged in
                    setInitialRole('LISTENER');
                    setAvailableRoles(['LISTENER']);
                }
            } catch (error) {
                console.error('Failed to get user roles:', error);
                setInitialRole('LISTENER');
                setAvailableRoles(['LISTENER']);
            }
        };

        getRolesFromSession();
    }, []);

    // Always render with RoleContextProvider, using default roles until fetched
    return (
        <RoleContextProvider initialRole={initialRole} availableRoles={availableRoles}>
            {children}
        </RoleContextProvider>
    );
}
