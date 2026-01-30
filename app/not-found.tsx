import Link from 'next/link';

/**
 * Custom 404 Not Found Page
 * 
 * Next.js App Router automatically routes undefined pages to this file.
 * This page is:
 * - Safe for prerendering (no external URLs or new URL() calls)
 * - Renders a helpful fallback UI
 * - Never crashes during build time
 */
export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center px-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-md">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="text-9xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text mb-4">
                        404
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 mx-auto rounded-full"></div>
                </div>

                {/* Message */}
                <h2 className="text-4xl font-bold text-white mb-4">
                    Page Not Found
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                    Oops! We couldn't find the page you're looking for. It might have been moved or deleted.
                </p>

                {/* Navigation Links */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/discover"
                        className="inline-block px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                    >
                        Explore Music
                    </Link>
                </div>

                {/* Helpful text */}
                <div className="mt-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-300">
                        <strong>Lost?</strong> Try navigating through our main menu or{' '}
                        <Link href="/" className="text-emerald-400 hover:text-emerald-300 underline">
                            return to home
                        </Link>
                        .
                    </p>
                </div>
            </div>

            {/* Status Code */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-gray-600 text-sm">
                Status Code: 404 | Page Not Found
            </div>
        </div>
    );
}
