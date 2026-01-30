'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from './Logo';
import GlobalSearch from './GlobalSearch';
import RoleContextSwitcher from './RoleContextSwitcher';
import { useSession, signOut } from 'next-auth/react';
import type { ExtendedSession } from '@/app/types/auth';
import AdminNav from './navigation/AdminNav';
import ArtistNav from './navigation/ArtistNav';
import ListenerNav from './navigation/ListenerNav';
import EntrepreneurNav from './navigation/EntrepreneurNav';
import MarketerNav from './navigation/MarketerNav';
import { useRole } from '@/app/hooks/useRole';

export default function RoleAwareHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
    const { activeRole, getRoleLabel, hasMultipleRoles } = useRole();

    if (status === 'loading') {
        return (
            <header className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-black/70 border-b border-zinc-800">
                <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Logo />
                    <div className="text-zinc-400">Loading...</div>
                </nav>
            </header>
        );
    }

    // Render different navigation based on active role
    const renderNav = () => {
        switch (activeRole) {
            case 'ADMIN':
                return <AdminNav isMobile={mobileMenuOpen} />;
            case 'ARTIST':
                return <ArtistNav isMobile={mobileMenuOpen} />;
            case 'LISTENER':
                return <ListenerNav isMobile={mobileMenuOpen} />;
            case 'ENTREPRENEUR':
                return <EntrepreneurNav isMobile={mobileMenuOpen} />;
            case 'MARKETER':
                return <MarketerNav isMobile={mobileMenuOpen} />;
            default:
                return <ListenerNav isMobile={mobileMenuOpen} />;
        }
    };

    return (
        <>
            {/* Main Header */}
            <header className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-black/70 border-b border-zinc-800">
                <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 gap-4">
                    {/* LOGO & MENU TOGGLE */}
                    <div className="flex items-center gap-4">
                        <Logo />

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden text-zinc-400 hover:text-white transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>

                        <span className="hidden sm:inline text-zinc-400 text-sm">
                            {activeRole === 'ADMIN' ? 'Platform Control' : 'African sounds — homegrown'}
                        </span>
                    </div>

                    {/* SEARCH - Hidden on mobile */}
                    <div className="hidden lg:block flex-1 max-w-md">
                        <GlobalSearch />
                    </div>

                    {/* RIGHT SIDE - Role Switcher & Profile */}
                    <div className="flex items-center gap-4">
                        {/* Role Context Switcher - Only if user has multiple roles */}
                        {hasMultipleRoles && (
                            <div className="hidden sm:block">
                                <RoleContextSwitcher />
                            </div>
                        )}

                        {/* Notifications - Navigate to notifications page */}
                        {session?.user ? (
                            <Link href="/notifications" className="text-zinc-400 hover:text-white transition-colors relative" title="Notifications">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </Link>
                        ) : (
                            <button className="text-zinc-400 hover:text-white transition-colors relative" title="Notifications (sign in to view)" disabled>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        )}

                        {/* Profile Avatar - Sign Out */}
                        {session?.user ? (
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm text-zinc-300"
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                                    {session.user.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-white text-sm font-medium"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </nav>

                {/* ROLE-SPECIFIC NAVIGATION - Hidden on mobile, visible on desktop */}
                <div className="hidden lg:block border-t border-zinc-800">
                    <div className="max-w-7xl mx-auto px-6">
                        {renderNav()}
                    </div>
                </div>
            </header>

            {/* MOBILE NAVIGATION - Shown when menu open */}
            {mobileMenuOpen && (
                <div className="fixed top-16 left-0 w-full bg-black/95 border-b border-zinc-800 lg:hidden z-40">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        {/* Mobile Search */}
                        <div className="mb-4">
                            <GlobalSearch />
                        </div>

                        {/* Mobile Role Switcher */}
                        {hasMultipleRoles && (
                            <div className="mb-4 pb-4 border-b border-zinc-800">
                                <RoleContextSwitcher />
                            </div>
                        )}

                        {/* Mobile Navigation */}
                        <div className="space-y-2">
                            {renderNav()}
                        </div>
                    </div>
                </div>
            )}

            {/* Spacing for fixed header */}
            <div className="h-20 lg:h-32"></div>
        </>
    );
}
