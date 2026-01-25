'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function EntrepreneurLayout({
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
        if (session && !(session.user as any)?.roles?.includes('ENTREPRENEUR')) {
            router.push('/');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!(session?.user as any)?.roles?.includes('ENTREPRENEUR')) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Entrepreneur Header */}
            <header className="bg-black/50 backdrop-blur border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-emerald-400">Business Dashboard</h1>
                        <div className="text-sm text-zinc-400">
                            {(session?.user as any)?.email}
                        </div>
                    </div>
                </div>
            </header>

            {/* Entrepreneur Navigation */}
            <nav className="bg-black/30 border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <Link
                            href="/entrepreneur/dashboard"
                            className="px-3 py-4 border-b-2 border-emerald-500 text-emerald-400 font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/entrepreneur/businesses"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                        >
                            Businesses
                        </Link>
                        <Link
                            href="/entrepreneur/ads"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                        >
                            Advertising
                        </Link>
                        <Link
                            href="/entrepreneur/payments"
                            className="px-3 py-4 border-b-2 border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 font-medium"
                        >
                            Payments
                        </Link>
                        <Link
                            href="/entrepreneur/settings"
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
