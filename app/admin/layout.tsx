'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({
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
        if (session && !(session.user as any)?.roles?.includes('ADMIN')) {
            router.push('/');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!(session?.user as any)?.roles?.includes('ADMIN')) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Admin Header */}
            <header className="bg-black/50 backdrop-blur border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-amber-400">NyasaWave Admin</h1>
                        <div className="text-sm text-zinc-400">
                            {(session?.user as any)?.email}
                        </div>
                    </div>
                </div>
            </header>

            {/* Admin Navigation */}
            <nav className="bg-black/30 border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <Link
                            href="/admin/dashboard"
                            className="px-3 py-4 border-b-2 border-amber-500 text-amber-400 font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/users"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                        >
                            Users
                        </Link>
                        <Link
                            href="/admin/artists"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                        >
                            Artists
                        </Link>
                        <Link
                            href="/admin/content"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                        >
                            Content
                        </Link>
                        <Link
                            href="/admin/tournaments"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                        >
                            Tournaments
                        </Link>
                        <Link
                            href="/admin/reports"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                        >
                            Reports
                        </Link>
                        <Link
                            href="/admin/settings"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                        >
                            Settings
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
