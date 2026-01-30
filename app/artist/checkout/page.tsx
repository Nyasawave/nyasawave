'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { BOOST_TYPES } from '../../../data/boost-pricing';
import type { ExtendedSession } from '@/app/types/auth';

function CheckoutContent() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const user = session?.user;
    const router = useRouter();
    const searchParams = useSearchParams();
    const songId = searchParams.get('songId');
    const boostType = searchParams.get('type') as keyof typeof BOOST_TYPES;

    const [selectedMethod, setSelectedMethod] = useState<'airtel' | 'tnm' | 'paypal'>('airtel');
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [agreed, setAgreed] = useState(false);

    if (!user || !user.roles?.includes('ARTIST')) {
        return (
            <main className="min-h-screen p-6 max-w-4xl mx-auto pt-32 text-center">
                <h1 className="text-3xl font-bold">Artist Only</h1>
                <p className="text-zinc-400 mt-4">Please sign in as an artist to continue.</p>
            </main>
        );
    }

    if (!songId || !boostType || !BOOST_TYPES[boostType]) {
        return (
            <main className="min-h-screen p-6 max-w-4xl mx-auto pt-32 text-center">
                <h1 className="text-3xl font-bold">Invalid Boost Request</h1>
                <p className="text-zinc-400 mt-4">Please select a valid song and boost type.</p>
                <Link href="/artist/dashboard" className="text-emerald-400 mt-6 inline-block hover:underline">
                    Back to Dashboard
                </Link>
            </main>
        );
    }

    const boost = BOOST_TYPES[boostType];

    const handlePayment = async () => {
        if (!phoneNumber) {
            alert('Please enter your phone number');
            return;
        }

        if (!agreed) {
            alert('Please agree to the terms');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/payments/initiate-boost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    songId,
                    boostType,
                    method: selectedMethod,
                    phoneNumber,
                    amount: boost.price.MWK,
                    currency: 'MWK',
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // In production, redirect to payment provider
                // For now, simulate success
                alert(
                    `Payment initiated for ${boost.name}!\n\nYou will receive a prompt on your ${selectedMethod.toUpperCase()} account.`
                );
                router.push(`/payment/success?boostId=${data.boostId}`);
            } else {
                alert(data?.error || 'Payment failed');
            }
        } catch (err) {
            console.error(err);
            alert('Payment initiation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/artist/dashboard" className="text-zinc-400 hover:text-white mb-12 inline-block">
                    ← Back to Dashboard
                </Link>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Order Summary */}
                    <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 h-fit">
                        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                        <div className="mb-8 pb-8 border-b border-zinc-700">
                            <div className="flex gap-4 mb-4">
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl">
                                    🎵
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-400">Boost Type</p>
                                    <p className="font-bold text-lg">{boost.name}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{boost.durationHours}h duration</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                                {boost.features.slice(0, 4).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-zinc-300">
                                        <span className="text-emerald-400">✓</span>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="space-y-3 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Boost Cost</span>
                                <span className="font-semibold">MWK {boost.price.MWK.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Platform Fee (5%)</span>
                                <span className="font-semibold">
                                    MWK {(boost.price.MWK * 0.05).toLocaleString()}
                                </span>
                            </div>
                            <div className="border-t border-zinc-700 pt-3 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-emerald-400">
                                    MWK {(boost.price.MWK * 1.05).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Expected ROI */}
                        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                            <p className="text-xs text-zinc-400 mb-2">Expected Performance</p>
                            <p className="text-2xl font-bold text-pink-400 mb-1">
                                ~{boost.playsEstimate.toLocaleString()} plays
                            </p>
                            <p className="text-xs text-zinc-500">
                                Based on similar boosts (results vary)
                            </p>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div>
                        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 mb-6">
                            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

                            {/* Payment Method */}
                            <div className="mb-8">
                                <label className="text-zinc-400 text-sm font-semibold block mb-3">
                                    Payment Method
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'airtel', name: 'Airtel Money', icon: '📱' },
                                        { id: 'tnm', name: 'TNM Mpamba', icon: '📲' },
                                    ].map((method) => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${selectedMethod === method.id
                                                ? 'border-emerald-500 bg-emerald-500/10'
                                                : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment-method"
                                                value={method.id}
                                                checked={selectedMethod === method.id}
                                                onChange={(e) => setSelectedMethod(e.target.value as any)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                            <span className="text-lg">{method.icon}</span>
                                            <span className="font-semibold">{method.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="mb-8">
                                <label htmlFor="phone" className="text-zinc-400 text-sm font-semibold block mb-3">
                                    {selectedMethod === 'airtel' ? 'Airtel Money Number' : 'TNM Mpamba Number'}
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder={selectedMethod === 'airtel' ? '0801234567' : '0701234567'}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                                />
                                <p className="text-xs text-zinc-500 mt-2">
                                    You'll receive a payment prompt on your {selectedMethod.toUpperCase()} app
                                </p>
                            </div>

                            {/* Terms */}
                            <div className="mb-8">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="w-4 h-4 mt-1 cursor-pointer"
                                    />
                                    <span className="text-xs text-zinc-400">
                                        I understand that boosts are non-refundable and expire after{' '}
                                        <strong>{boost.durationHours} hours</strong>. I agree to NyasaWave's terms of service.
                                    </span>
                                </label>
                            </div>

                            {/* Payment Button */}
                            <button
                                onClick={handlePayment}
                                disabled={loading || !phoneNumber || !agreed}
                                className={`w-full py-3 rounded-lg font-bold text-white transition ${loading || !phoneNumber || !agreed
                                    ? 'bg-zinc-700 cursor-not-allowed opacity-50'
                                    : 'bg-emerald-500 hover:bg-emerald-400'
                                    }`}
                            >
                                {loading
                                    ? 'Processing Payment...'
                                    : `Pay MWK ${(boost.price.MWK * 1.05).toLocaleString()}`}
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="space-y-2 text-xs text-zinc-500">
                            <div className="flex gap-2 items-center">
                                <span>🔒</span>
                                <span>Payments are secure and processed via trusted providers</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <span>⏱️</span>
                                <span>Most boosts activate within 15 minutes</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <span>📊</span>
                                <span>Track your boost performance in real-time</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
