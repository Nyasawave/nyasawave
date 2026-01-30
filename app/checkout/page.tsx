'use client';

import { useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { ExtendedSession } from '@/app/types/auth';

function CheckoutContent() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const user = session?.user;
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('product');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        paymentMethod: 'card',
        cardName: '',
        cardNumber: '',
        cardExpiry: '',
        cardCVC: '',
        shippingAddress: '',
    });

    if (!user) {
        return (
            <main className="min-h-screen pt-32 pb-16 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Sign In to Checkout</h1>
                    <p className="text-zinc-400 mb-8">You need to be signed in to make a purchase.</p>
                    <Link href="/signin" className="bg-emerald-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-emerald-300 transition inline-block">
                        Sign In
                    </Link>
                </div>
            </main>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate form
            if (!formData.cardName || !formData.cardNumber || !formData.cardExpiry || !formData.cardCVC) {
                throw new Error('Please fill in all payment details');
            }

            // Mock payment processing
            const response = await fetch('/api/payments/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 2500,
                    currency: 'MWK',
                    type: 'marketplace_purchase',
                    productId: productId || 'unknown',
                    paymentMethod: formData.paymentMethod,
                    metadata: {
                        buyerId: user.id,
                        shippingAddress: formData.shippingAddress,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Payment failed');
            }

            const data = await response.json();

            if (data.ok) {
                // Redirect to success page
                router.push('/checkout/success');
            } else {
                throw new Error(data.error || 'Payment processing failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black pt-32 pb-16 px-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Checkout</h1>

                {error && (
                    <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
                        {/* Shipping Information */}
                        <fieldset className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                            <legend className="text-lg font-semibold text-white mb-4">Shipping Information</legend>

                            <div>
                                <label htmlFor="shippingAddress" className="block text-sm font-medium text-zinc-300 mb-2">
                                    Delivery Address
                                </label>
                                <textarea
                                    id="shippingAddress"
                                    name="shippingAddress"
                                    value={formData.shippingAddress}
                                    onChange={handleInputChange}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                    rows={3}
                                    placeholder="Street address, City, Country"
                                />
                            </div>
                        </fieldset>

                        {/* Payment Method */}
                        <fieldset className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                            <legend className="text-lg font-semibold text-white mb-4">Payment Method</legend>

                            <div className="space-y-3 mb-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={formData.paymentMethod === 'card'}
                                        onChange={handleInputChange}
                                        className="mr-3"
                                    />
                                    <span className="text-white">Credit/Debit Card</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="mobile_money"
                                        checked={formData.paymentMethod === 'mobile_money'}
                                        onChange={handleInputChange}
                                        className="mr-3"
                                    />
                                    <span className="text-white">Mobile Money (Airtel/TNM)</span>
                                </label>
                            </div>

                            {formData.paymentMethod === 'card' && (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="cardName" className="block text-sm font-medium text-zinc-300 mb-2">
                                            Name on Card *
                                        </label>
                                        <input
                                            id="cardName"
                                            name="cardName"
                                            value={formData.cardName}
                                            onChange={handleInputChange}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                            placeholder="Full name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="cardNumber" className="block text-sm font-medium text-zinc-300 mb-2">
                                            Card Number *
                                        </label>
                                        <input
                                            id="cardNumber"
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleInputChange}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                            placeholder="4111 1111 1111 1111"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="cardExpiry" className="block text-sm font-medium text-zinc-300 mb-2">
                                                Expiry *
                                            </label>
                                            <input
                                                id="cardExpiry"
                                                name="cardExpiry"
                                                value={formData.cardExpiry}
                                                onChange={handleInputChange}
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                                placeholder="MM/YY"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="cardCVC" className="block text-sm font-medium text-zinc-300 mb-2">
                                                CVC *
                                            </label>
                                            <input
                                                id="cardCVC"
                                                name="cardCVC"
                                                value={formData.cardCVC}
                                                onChange={handleInputChange}
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                                placeholder="123"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </fieldset>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-400 text-black font-semibold py-3 rounded-lg hover:bg-emerald-300 transition disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Complete Purchase'}
                        </button>
                    </form>

                    {/* Order Summary */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 h-fit">
                        <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-zinc-300">
                                <span>Product</span>
                                <span>2,500 MWK</span>
                            </div>
                            <div className="flex justify-between text-zinc-300">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                        </div>

                        <div className="border-t border-zinc-700 pt-3 flex justify-between">
                            <span className="font-semibold text-white">Total</span>
                            <span className="text-xl font-bold text-emerald-400">2,500 MWK</span>
                        </div>

                        <p className="text-xs text-zinc-500 mt-4">
                            This is a demo. Actual payments require real Stripe/Flutterwave integration.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-32 pb-16 px-6"><div className="max-w-2xl mx-auto text-center"><p className="text-zinc-400">Loading...</p></div></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
