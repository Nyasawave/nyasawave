"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ExtendedSession } from "@/app/types/auth";

export default function PaymentPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const user = session?.user;
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual" | null>(null);
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <main className="min-h-screen p-6 pt-32 max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-bold">Premium Subscription</h1>
                <p className="text-zinc-400 mt-4">Sign in to subscribe to premium.</p>
                <Link
                    href="/signin"
                    className="mt-6 inline-block bg-emerald-400 text-black px-6 py-2 rounded font-semibold hover:bg-emerald-300"
                >
                    Sign In
                </Link>
            </main>
        );
    }

    const handleCheckout = async (plan: "monthly" | "annual") => {
        setLoading(true);
        try {
            const res = await fetch("/api/payments/initiate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("nyasawave_token") || ""}`,
                },
                body: JSON.stringify({
                    type: "subscription",
                    plan,
                    amount: plan === "monthly" ? 99 : 999,
                }),
            });

            const data = await res.json();
            if (data.ok) {
                router.push(`/payment/checkout?sessionId=${data.sessionId}`);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert("Payment initiation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-6 pt-32 max-w-6xl mx-auto">
            <section className="text-center mb-12">
                <h1 className="text-4xl font-bold">Premium Subscription</h1>
                <p className="text-zinc-400 mt-4 text-lg">
                    Unlock unlimited streaming, no ads, and exclusive features
                </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {/* Monthly Plan */}
                <div className="border border-zinc-800 rounded-lg p-8 hover:border-emerald-400 transition">
                    <h2 className="text-2xl font-bold mb-4">Monthly</h2>
                    <div className="text-4xl font-bold text-emerald-400 mb-2">MWK 99</div>
                    <p className="text-zinc-400 mb-6">/month, cancel anytime</p>
                    <ul className="space-y-3 mb-8 text-sm">
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> Unlimited streaming
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> No ads
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> Download songs
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> Offline listening
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> High audio quality
                        </li>
                    </ul>
                    <button
                        onClick={() => handleCheckout("monthly")}
                        disabled={loading || user.premiumListener}
                        className="w-full bg-emerald-400 text-black px-6 py-3 rounded font-semibold hover:bg-emerald-300 disabled:bg-zinc-600 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Processing..." : user.premiumListener ? "Current Plan" : "Subscribe Now"}
                    </button>
                </div>

                {/* Annual Plan */}
                <div className="border border-emerald-400 rounded-lg p-8 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-400 text-black px-4 py-1 rounded text-sm font-semibold">
                        Save 20%
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Annual</h2>
                    <div className="text-4xl font-bold text-emerald-400 mb-2">MWK 999</div>
                    <p className="text-zinc-400 mb-6">~MWK 83/month, save MWK 180</p>
                    <ul className="space-y-3 mb-8 text-sm">
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> Unlimited streaming
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> No ads
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> Download songs
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> Offline listening
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> High audio quality
                        </li>
                    </ul>
                    <button
                        onClick={() => handleCheckout("annual")}
                        disabled={loading || user.premiumListener}
                        className="w-full bg-emerald-400 text-black px-6 py-3 rounded font-semibold hover:bg-emerald-300 disabled:bg-zinc-600 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Processing..." : user.premiumListener ? "Current Plan" : "Subscribe Now"}
                    </button>
                </div>
            </section>

            {/* Current Subscription Info */}
            {user.premiumListener && (
                <section className="mt-12 max-w-3xl mx-auto p-6 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Your Subscription</h3>
                    <p className="text-zinc-400">
                        You have Premium access
                    </p>
                </section>
            )}

            {/* FAQ */}
            <section className="mt-16 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-8">FAQ</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                        <p className="text-zinc-400">Yes, cancel your subscription at any time. Your access continues until the end of your billing period.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                        <p className="text-zinc-400">We accept credit/debit cards via Stripe and mobile money via Flutterwave.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                        <p className="text-zinc-400">Currently we don't offer a free trial, but you can try free features on the platform first.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Do you offer family plans?</h3>
                        <p className="text-zinc-400">Family plans are coming soon. Subscribe to newsletter for updates.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
