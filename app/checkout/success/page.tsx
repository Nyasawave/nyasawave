/**
 * CHECKOUT SUCCESS PAGE
 * 
 * Displayed after successful payment
 * Updates user session to reflect premium status
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CheckoutSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, update: updateSession } = useSession();
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processPayment = async () => {
            try {
                const sessionId = searchParams.get("session_id");

                if (!sessionId) {
                    setError("No session ID provided");
                    setIsProcessing(false);
                    return;
                }

                // Verify payment on backend
                const response = await fetch(`/api/payments/verify?session_id=${sessionId}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Payment verification failed");
                }

                const data = await response.json();

                // Update session to reflect premium status
                if (data.success) {
                    await updateSession({
                        user: {
                            ...session?.user,
                            premiumListener: true,
                        },
                    });
                }

                setIsProcessing(false);
            } catch (err) {
                console.error("Payment processing error:", err);
                setError(err instanceof Error ? err.message : "Payment processing failed");
                setIsProcessing(false);
            }
        };

        processPayment();
    }, [searchParams, session, updateSession]);

    if (isProcessing) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-32 pb-16 px-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block">
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    </div>
                    <p className="text-white text-lg">Processing your payment...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-32 pb-16 px-6 flex items-center justify-center">
                <div className="max-w-md w-full text-center">
                    <div className="mb-6">
                        <div className="text-5xl mb-4">❌</div>
                        <h1 className="text-3xl font-bold text-white">Payment Failed</h1>
                    </div>

                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-6">
                        <p className="text-red-200">{error}</p>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/subscribe"
                            className="block w-full bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-400 transition"
                        >
                            Try Again
                        </Link>
                        <Link
                            href="/me"
                            className="block w-full bg-gray-800 text-white font-semibold py-3 rounded-lg hover:bg-gray-700 transition"
                        >
                            Go to Settings
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-32 pb-16 px-6 flex items-center justify-center">
            <div className="max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/20 border border-green-500 mb-4">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
                    <p className="text-gray-300 mb-4">
                        Welcome to Premium! Your subscription is now active.
                    </p>

                    <div className="bg-gray-800/50 rounded p-4 mb-4 text-left space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className="text-green-400 font-semibold">✓ Active</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Plan:</span>
                            <span className="text-white font-semibold">Premium</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400">
                        Your benefits are active immediately
                    </p>
                </div>

                <div className="mb-6 text-left">
                    <h2 className="text-white font-semibold mb-3">Your New Benefits:</h2>
                    <ul className="space-y-2">
                        <li className="text-green-400">✓ Unlimited song downloads</li>
                        <li className="text-green-400">✓ Access to tournaments</li>
                        <li className="text-green-400">✓ Priority support</li>
                        <li className="text-green-400">✓ Ad-free listening</li>
                        <li className="text-green-400">✓ Marketplace features</li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/discover"
                        className="block w-full bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-400 transition"
                    >
                        Start Exploring
                    </Link>
                    <Link
                        href="/me"
                        className="block w-full border border-gray-600 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition"
                    >
                        View Settings
                    </Link>
                    <Link
                        href="/"
                        className="block w-full text-gray-400 hover:text-white transition"
                    >
                        Back to Home
                    </Link>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                    Questions? Contact support@nyasawave.com
                </p>
            </div>
        </main>
    );
}
