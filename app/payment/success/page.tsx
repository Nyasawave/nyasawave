'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const boostId = searchParams.get('boostId');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    router.push('/artist/dashboard');
                    return 0;
                }
                return c - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20 flex items-center justify-center">
            <div className="max-w-md mx-auto px-6 text-center">
                {/* Success Icon */}
                <div className="mb-8">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <span className="text-5xl">✓</span>
                    </div>
                </div>

                <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
                <p className="text-zinc-400 mb-8">
                    Your boost has been activated. Your track will start appearing in promoted placements immediately.
                </p>

                {/* Boost ID */}
                {boostId && (
                    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 mb-8">
                        <p className="text-xs text-zinc-500 mb-1">Boost ID</p>
                        <p className="font-mono text-sm text-emerald-400">{boostId}</p>
                    </div>
                )}

                {/* Next Steps */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-8 text-left">
                    <h2 className="font-bold mb-4 flex items-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        Next Steps
                    </h2>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li className="flex gap-3">
                            <span className="text-emerald-400 font-bold">1.</span>
                            <span>Your boost is now active and will run for the selected duration</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-emerald-400 font-bold">2.</span>
                            <span>Check your Analytics page for real-time performance data</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-emerald-400 font-bold">3.</span>
                            <span>We'll send you updates when milestone play counts are reached</span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link
                        href="/artist/analytics"
                        className="block w-full py-3 rounded-lg font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition"
                    >
                        View Analytics
                    </Link>
                    <Link
                        href="/artist/dashboard"
                        className="block w-full py-3 rounded-lg font-bold bg-zinc-800 text-white hover:bg-zinc-700 transition"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                {/* Auto Redirect Notice */}
                <p className="text-xs text-zinc-500 mt-8">
                    Redirecting to dashboard in {countdown}s...
                </p>
            </div>
        </main>
    );
}

export default function PaymentSuccess() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
