'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ListenerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
        // Listener is the default role, allow access even if only LISTENER role
        // but don't restrict here since listeners can access public pages too
    }, [status, router]);

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Listener Header */}
            <header className="bg-black/50 backdrop-blur border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-blue-400">Music Library</h1>
                        <div className="text-sm text-zinc-400">
                            {session?.user?.email || 'Guest'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Listener Navigation */}
            {session && (
                <nav className="bg-black/30 border-b border-zinc-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex space-x-8">
                            <Link
                                href="/listener/dashboard"
                                className="px-3 py-4 border-b-2 border-blue-500 text-blue-400 font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/listener/library"
                                className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                            >
                                My Library
                            </Link>
                            <Link
                                href="/listener/tournaments"
                                className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                            >
                                Tournaments
                            </Link>
                            <Link
                                href="/listener/profile"
                                className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                            >
                                Profile
                            </Link>
                            <Link
                                href="/listener/settings"
                                className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                            >
                                Settings
                            </Link>
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
