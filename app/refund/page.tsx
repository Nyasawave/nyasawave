'use client';

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-black pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-4xl font-bold text-white mb-4">Refund Policy</h1>
                <p className="text-zinc-400 mb-12">Last updated: January 15, 2026</p>

                <div className="space-y-8 text-zinc-300">
                    {/* 1. Overview */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">1. Overview</h2>
                        <p>
                            At NyasaWave, we want you to be satisfied with your purchase. If you&apos;re not happy
                            with a transaction, we offer refunds under the conditions outlined in this policy.
                        </p>
                    </section>

                    {/* 2. Subscription Refunds */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">2. Subscription Refunds</h2>
                        <div className="space-y-2 ml-4">
                            <p><strong>Eligibility:</strong> Refunds available within 14 days of purchase</p>
                            <p><strong>Process:</strong> Contact support@nyasawave.com with order number</p>
                            <p><strong>Timeframe:</strong> Refund issued within 7 business days</p>
                            <p><strong>Cancellation:</strong> You can cancel anytime; refund applies to unused portions</p>
                        </div>
                    </section>

                    {/* 3. Music & Digital Products */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">3. Music & Digital Products</h2>
                        <p>
                            Due to the nature of digital products, refunds are limited:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Exclusive tracks: Refundable within 48 hours if not downloaded</p>
                            <p>• Beats & instrumentals: Refundable if not used in production</p>
                            <p>• Services: Refundable if not started</p>
                        </div>
                        <p className="mt-3">
                            Once a digital product is downloaded and used, refunds are typically not available
                            to protect artist rights.
                        </p>
                    </section>

                    {/* 4. Marketplace Purchases */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">4. Marketplace Purchases</h2>
                        <div className="space-y-2 ml-4">
                            <p><strong>Physical Items:</strong> Refundable within 30 days if not received or damaged</p>
                            <p><strong>Return Shipping:</strong> Seller covers if item is defective</p>
                            <p><strong>Condition:</strong> Item must be in original, unused condition</p>
                            <p><strong>Disputes:</strong> Use order dispute system for resolution</p>
                        </div>
                    </section>

                    {/* 5. Non-Refundable Items */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">5. Non-Refundable Items</h2>
                        <p>The following are generally non-refundable:</p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Digital products once downloaded and used</p>
                            <p>• Completed services (mixing, mastering, features)</p>
                            <p>• Promotional ads that have already run</p>
                            <p>• Track boosts that have been active</p>
                            <p>• Artist verification fees</p>
                            <p>• Business verification fees (unless business rejected)</p>
                        </div>
                    </section>

                    {/* 6. Refund Process */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">6. Refund Process</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="font-semibold text-white">Step 1: Request</p>
                                <p className="ml-4 mt-1">Email support@nyasawave.com with order details</p>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Step 2: Review</p>
                                <p className="ml-4 mt-1">We review your request (2-3 business days)</p>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Step 3: Approval</p>
                                <p className="ml-4 mt-1">We notify you of approval or rejection</p>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Step 4: Processing</p>
                                <p className="ml-4 mt-1">Refund issued to original payment method (7 days)</p>
                            </div>
                        </div>
                    </section>

                    {/* 7. Disputed Transactions */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">7. Disputed Transactions</h2>
                        <p>
                            For unauthorized charges or disputes, contact support immediately. We investigate
                            all claims and work with payment providers to resolve issues.
                        </p>
                    </section>

                    {/* 8. Artist Payouts */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">8. Artist Payouts & Reversals</h2>
                        <p>
                            If a refund is issued for a purchase:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Artist commission is reversed</p>
                            <p>• Stream statistics are adjusted</p>
                            <p>• Earnings report is updated</p>
                        </div>
                    </section>

                    {/* 9. Exceptions */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">9. Exceptions & Special Cases</h2>
                        <p>
                            NyasaWave reserves the right to deny refunds in cases of:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Fraud or suspicious activity</p>
                            <p>• Refund abuse or excessive refund requests</p>
                            <p>• Breach of Terms of Service</p>
                            <p>• Account termination due to violation</p>
                        </div>
                    </section>

                    {/* 10. Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">10. Contact Support</h2>
                        <p>
                            Questions about refunds? Contact us:
                        </p>
                        <p className="mt-3">
                            Email: support@nyasawave.com<br />
                            Response time: 24-48 hours
                        </p>
                    </section>

                    {/* Footer */}
                    <div className="border-t border-zinc-700 pt-8 mt-12">
                        <p className="text-sm text-zinc-500">
                            © 2026 NyasaWave. This Refund Policy applies to all transactions on the platform.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
