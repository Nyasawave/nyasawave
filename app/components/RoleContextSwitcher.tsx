'use client';

import { useState, useRef, useEffect } from 'react';
import { useRole } from '@/app/context/RoleContext';
import { useSession, signOut } from 'next-auth/react';

export default function RoleContextSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const { activeRole, availableRoles, switchRole, isLoading, error } = useRole();
    const { data: session } = useSession();
    const menuRef = useRef<HTMLDivElement>(null);

    // Role display names
    const roleNames: Record<string, string> = {
        ADMIN: '🛡️ Admin',
        ARTIST: '🎵 Artist',
        LISTENER: '🎧 Listener',
        ENTREPRENEUR: '🛍️ Entrepreneur',
        MARKETER: '📢 Marketer',
    };

    const roleColors: Record<string, string> = {
        ADMIN: 'bg-blue-600',
        ARTIST: 'bg-purple-600',
        LISTENER: 'bg-green-600',
        ENTREPRENEUR: 'bg-orange-600',
        MARKETER: 'bg-red-600',
    };

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            {/* Switcher Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isOpen
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
            >
                <span className="text-sm hidden sm:inline">Operating as:</span>
                <span className={`px-2 py-1 rounded text-white text-sm font-semibold ${roleColors[activeRole]}`}>
                    {roleNames[activeRole]}
                </span>
                <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                        {/* Available Roles */}
                        <div className="mb-2">
                            <p className="text-xs text-zinc-500 px-3 py-2 font-semibold">Switch Role:</p>
                            {availableRoles.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => {
                                        if (role !== activeRole) {
                                            switchRole(role);
                                            setIsOpen(false);
                                        }
                                    }}
                                    disabled={isLoading || role === activeRole}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${role === activeRole
                                            ? `${roleColors[role]} text-white font-semibold flex items-center gap-2`
                                            : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                        }`}
                                >
                                    {role === activeRole && <span>✓</span>}
                                    {roleNames[role]}
                                </button>
                            ))}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="px-3 py-2 text-red-400 text-xs bg-red-900/20 rounded-lg mb-2">
                                {error}
                            </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-zinc-700 my-2"></div>

                        {/* User Info & Sign Out */}
                        {session?.user?.email && (
                            <div className="px-3 py-2 text-xs text-zinc-400 mb-2">
                                <p className="truncate">{session.user.email}</p>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                signOut({ redirectUrl: '/login' });
                            }}
                            className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg text-sm transition-colors"
                        >
                            🚪 Sign Out
                        </button>
                    </div>
                </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-4 text-center">
                    <p className="text-sm text-zinc-400">Switching role...</p>
                </div>
            )}
        </div>
    );
}
