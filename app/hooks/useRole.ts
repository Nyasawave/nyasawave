'use client';

import { useContext } from 'react';
import { UserRole } from '@/app/utils/auth-types';
import { RoleContext } from '@/app/context/RoleContext';

export function useRole() {
    const context = useContext(RoleContext);

    if (context === undefined) {
        throw new Error('useRole must be used within RoleContextProvider');
    }

    const {
        activeRole,
        availableRoles,
        switchRole,
        canSwitchTo,
        isLoading,
        error
    } = context;

    // Convenience methods
    const isAdmin = activeRole === 'ADMIN';
    const isArtist = activeRole === 'ARTIST';
    const isListener = activeRole === 'LISTENER';
    const isEntrepreneur = activeRole === 'ENTREPRENEUR';
    const isMarketer = activeRole === 'MARKETER';

    const hasRole = (role: UserRole) => activeRole === role;
    const hasAnyRole = (...roles: UserRole[]) => roles.includes(activeRole);
    const hasMultipleRoles = availableRoles.length > 1;

    const getRoleLabel = (role?: UserRole): string => {
        const r = role || activeRole;
        switch (r) {
            case 'ADMIN':
                return 'Admin';
            case 'ARTIST':
                return 'Artist';
            case 'LISTENER':
                return 'Listener';
            case 'ENTREPRENEUR':
                return 'Entrepreneur';
            case 'MARKETER':
                return 'Marketer';
            default:
                return 'User';
        }
    };

    return {
        // State
        activeRole,
        availableRoles,
        isLoading,
        error,

        // Actions
        switchRole,
        canSwitchTo,

        // Convenience checks
        isAdmin,
        isArtist,
        isListener,
        isEntrepreneur,
        isMarketer,
        hasRole,
        hasAnyRole,
        hasMultipleRoles,

        // Utilities
        getRoleLabel
    };
}
