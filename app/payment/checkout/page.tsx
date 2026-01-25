'use client';

import { useState } from 'react';
import styles from '../payment.module.css';
import { PAYMENT_METHODS, PAYMENT_FEES } from '../../../lib/payments';

export default function PaymentCheckout() {
    const [amount, setAmount] = useState<number>(15000);
    const [currency, setCurrency] = useState<'MWK' | 'USD'>('MWK');
    const [selectedProvider, setSelectedProvider] = useState<string>(PAYMENT_METHODS[0].id);
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string>('');

    const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedProvider);

    // Calculate fees
    const calculateFees = () => {
        if (!selectedMethod) return { subtotal: 0, platformFee: 0, paymentFee: 0, total: 0 };

        const paymentFee = (amount * selectedMethod.fee) / 100;
        const platformFee = (amount * 0.05); // 5% platform fee
        const total = amount + paymentFee + platformFee;

        return {
            subtotal: amount,
            paymentFee: Math.round(paymentFee),
            platformFee: Math.round(platformFee),
            total: Math.round(total),
        };
    };

    const fees = calculateFees();

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber.trim()) {
            setError('Please enter your phone number');
            return;
        }

        if (!selectedMethod) {
            setError('Please select a payment method');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Simulate payment processing
            const response = await fetch('/api/payments/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    currency,
                    provider: selectedProvider,
                    phoneNumber,
                    type: 'BOOST',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = '/payment/success?id=' + data.paymentId;
                }, 2000);
            } else {
                setError(data.error || 'Payment failed. Please try again.');
            }
        } catch (err) {
            setError('Payment processing error. Please try again.');
            console.error(err);
        }

        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold">Complete Payment</h1>
                    <p className="text-zinc-400 mt-2">Secure payment processing powered by leading providers</p>
                </div>

                <form onSubmit={handlePayment} className="grid md:grid-cols-2 gap-8">
                    {/* Left: Payment Form */}
                    <div className="space-y-8">
                        {/* Amount */}
                        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                            <h2 className="text-xl font-bold mb-6">Amount</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-semibold mb-2">Payment Amount</label>
                                    <div className="flex gap-2">
                                        <input
                                            id="amount"
                                            type="number"
                                            min="1000"
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-400"
                                        />
                                        <select
                                            aria-label="Currency selection"
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value as 'MWK' | 'USD')}
                                            className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-400"
                                        >
                                            <option value="MWK">MWK</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                            <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                            <div className="space-y-3">
                                {PAYMENT_METHODS.map(method => (
                                    <label key={method.id} className={`${styles.paymentMethodLabel} ${selectedProvider === method.id
                                        ? styles.paymentMethodLabelActive
                                        : styles.paymentMethodLabelInactive
                                        }`}>
                                        <input
                                            type="radio"
                                            name="provider"
                                            value={method.id}
                                            checked={selectedProvider === method.id}
                                            onChange={(e) => setSelectedProvider(e.target.value)}
                                            className="w-4 h-4"
                                        />
                                        <div className="ml-4 flex-1">
                                            <p className="font-semibold">{method.icon} {method.name}</p>
                                            <p className="text-xs text-zinc-400">
                                                {method.processingTime} • Fee: {method.fee}%
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                            <h2 className="text-xl font-bold mb-6">Mobile Money Details</h2>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold mb-2">Phone Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder={selectedProvider === 'AIRTEL_MONEY' ? "+265712345678" : "+265988123456"}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                                />
                                <p className="text-xs text-zinc-400 mt-2">
                                    Standard {selectedMethod?.name} format required
                                </p>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4">
                                <p className="text-emerald-300 text-sm">Payment successful! Redirecting...</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Order Summary */}
                    <div className={styles.orderSummary}>
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Subtotal</span>
                                <span className="font-semibold">{currency === 'MWK' ? `MWK ${fees.subtotal.toLocaleString()}` : `$${(fees.subtotal / 10000).toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Payment Processing Fee ({selectedMethod?.fee || 0}%)</span>
                                <span className="font-semibold">{currency === 'MWK' ? `MWK ${fees.paymentFee.toLocaleString()}` : `$${(fees.paymentFee / 10000).toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Platform Fee (5%)</span>
                                <span className="font-semibold">{currency === 'MWK' ? `MWK ${fees.platformFee.toLocaleString()}` : `$${(fees.platformFee / 10000).toFixed(2)}`}</span>
                            </div>
                            <div className="border-t border-zinc-700 pt-4 flex justify-between">
                                <span className="font-bold">Total</span>
                                <span className="text-2xl font-bold text-emerald-400">
                                    {currency === 'MWK' ? `MWK ${fees.total.toLocaleString()}` : `$${(fees.total / 10000).toFixed(2)}`}
                                </span>
                            </div>
                        </div>

                        {/* Provider Info */}
                        {selectedMethod && (
                            <div className="bg-zinc-800 rounded-lg p-4 mb-6 border border-zinc-700">
                                <p className="text-xs text-zinc-400 mb-2">Processing with</p>
                                <p className="font-semibold text-lg">{selectedMethod.icon} {selectedMethod.name}</p>
                                <p className="text-xs text-zinc-400 mt-2">
                                    Processing time: {selectedMethod.processingTime}
                                </p>
                            </div>
                        )}

                        {/* Security Info */}
                        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-700 text-xs text-zinc-400 space-y-2">
                            <p>✓ Secure encrypted transaction</p>
                            <p>✓ No card data stored</p>
                            <p>✓ PCI DSS compliant</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !phoneNumber}
                            className="w-full bg-emerald-500 text-black py-3 rounded-lg font-bold hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing Payment...' : `Pay ${currency === 'MWK' ? `MWK ${fees.total.toLocaleString()}` : `$${(fees.total / 10000).toFixed(2)}`}`}
                        </button>

                        {/* T&C */}
                        <p className="text-xs text-zinc-500 mt-4 text-center">
                            By completing this payment, you agree to our Terms & Conditions
                        </p>
                    </div>
                </form>
            </div>
        </main>
    );
}
