'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ArtistLayout({
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
        if (session && !(session.user as any)?.roles?.includes('ARTIST')) {
            router.push('/');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!(session?.user as any)?.roles?.includes('ARTIST')) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Artist Header */}
            <header className="bg-black/50 backdrop-blur border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-purple-400">My Music Studio</h1>
                        <div className="text-sm text-zinc-400">
                            {(session?.user as any)?.email}
                        </div>
                    </div>
                </div>
            </header>

            {/* Artist Navigation */}
            <nav className="bg-black/30 border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        <Link
                            href="/artist/dashboard"
                            className="px-3 py-4 border-b-2 border-purple-500 text-purple-400 font-medium whitespace-nowrap"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/artist/upload"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium whitespace-nowrap"
                        >
                            Upload Music
                        </Link>
                        <Link
                            href="/artist/tracks"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium whitespace-nowrap"
                        >
                            My Songs
                        </Link>
                        <Link
                            href="/artist/analytics"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium whitespace-nowrap"
                        >
                            Analytics
                        </Link>
                        <Link
                            href="/artist/tournaments"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium whitespace-nowrap"
                        >
                            Tournaments
                        </Link>
                        <Link
                            href="/artist/wallet"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium whitespace-nowrap"
                        >
                            Wallet
                        </Link>
                        <Link
                            href="/artist/settings"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium whitespace-nowrap"
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
