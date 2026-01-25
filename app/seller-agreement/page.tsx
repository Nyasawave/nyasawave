'use client';

export default function SellerAgreementPage() {
    return (
        <div className="min-h-screen bg-black pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-4xl font-bold text-white mb-4">Seller Agreement</h1>
                <p className="text-zinc-400 mb-12">Last updated: January 15, 2026</p>

                <div className="space-y-8 text-zinc-300">
                    {/* 1. Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">1. Seller Eligibility</h2>
                        <p>
                            By registering as a seller (Artist or Business) on NyasaWave, you agree to this Seller Agreement.
                            You must be:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• At least 18 years old (or have parental consent)</p>
                            <p>• Legally authorized to enter binding agreements</p>
                            <p>• Authorized to sell the products/services you offer</p>
                            <p>• Compliant with all applicable laws and regulations</p>
                        </div>
                    </section>

                    {/* 2. Product Requirements */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">2. Product & Content Requirements</h2>
                        <p>All products/content you offer must:</p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Be original or properly licensed</p>
                            <p>• Not infringe third-party intellectual property rights</p>
                            <p>• Not contain malicious code, viruses, or exploits</p>
                            <p>• Be accurately described and priced</p>
                            <p>• Comply with all applicable laws</p>
                            <p>• Not include hate speech, violence, or harassment</p>
                            <p>• Include proper metadata and licensing information</p>
                        </div>
                    </section>

                    {/* 3. Verification Requirements */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">3. Verification & KYC</h2>
                        <p>
                            To process payouts and ensure seller legitimacy, you must:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Complete identity verification (KYC)</p>
                            <p>• Provide valid government-issued ID</p>
                            <p>• Verify email and phone number</p>
                            <p>• Provide banking information for payouts</p>
                            <p>• Allow NyasaWave to verify information</p>
                        </div>
                        <p className="mt-3">
                            Incomplete or fraudulent information may result in account suspension or termination.
                        </p>
                    </section>

                    {/* 4. Commission Structure */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">4. Commission & Fees</h2>
                        <div className="space-y-2 ml-4">
                            <p><strong>Artists:</strong> 70% of streaming revenue (0.2¢/stream)</p>
                            <p><strong>Music Sales:</strong> 85% for artist, 15% NyasaWave fee</p>
                            <p><strong>Merchandise:</strong> 90% for seller, 10% NyasaWave fee</p>
                            <p><strong>Services:</strong> 90% for seller, 10% NyasaWave fee</p>
                            <p><strong>Ads:</strong> Ad fees charged to business advertisers</p>
                        </div>
                        <p className="mt-3">
                            We reserve the right to adjust commission structures with 30 days notice.
                        </p>
                    </section>

                    {/* 5. Payout Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">5. Payout Terms & Withdrawal</h2>
                        <div className="space-y-2 ml-4">
                            <p>• Minimum payout threshold: 50 MWK / $0.50 USD</p>
                            <p>• Payouts processed weekly (every Friday)</p>
                            <p>• Processing time: 3-5 business days</p>
                            <p>• Available methods: Mobile Money (Airtel, TNM), Bank Transfer</p>
                            <p>• Withdrawal requests must have verified bank details</p>
                            <p>• International sellers: PayPal or Wire Transfer</p>
                        </div>
                    </section>

                    {/* 6. Suspension & Termination */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">6. Suspension & Termination</h2>
                        <p>
                            NyasaWave may suspend or terminate your seller account if you:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Violate this agreement or platform terms</p>
                            <p>• Upload infringing or illegal content</p>
                            <p>• Engage in fraudulent activity</p>
                            <p>• Have excessive customer complaints</p>
                            <p>• Fail verification requirements</p>
                            <p>• Have outstanding disputes or chargebacks</p>
                        </div>
                        <p className="mt-3">
                            Suspended accounts may request appeal within 30 days. Termination is final.
                        </p>
                    </section>

                    {/* 7. Content Moderation */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">7. Content Moderation & Removal</h2>
                        <p>
                            NyasaWave reserves the right to remove any content that violates our policies.
                            You will be notified of removal and reason. You may appeal removals within 14 days.
                        </p>
                    </section>

                    {/* 8. Disputes & Claims */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">8. Disputes & Chargebacks</h2>
                        <p>
                            In case of customer disputes or chargebacks:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• You will be notified immediately</p>
                            <p>• You have 7 days to respond with evidence</p>
                            <p>• Payment will be held pending resolution</p>
                            <p>• Chargeback fees will be deducted from your account</p>
                            <p>• Multiple chargebacks may result in account termination</p>
                        </div>
                    </section>

                    {/* 9. Liability & Indemnification */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">9. Liability & Indemnification</h2>
                        <p>
                            You agree to indemnify NyasaWave from any claims, damages, or losses arising from:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Your violation of this agreement</p>
                            <p>• Your content infringing third-party rights</p>
                            <p>• Your fraudulent or illegal activity</p>
                            <p>• Customer disputes related to your products</p>
                        </div>
                    </section>

                    {/* 10. Tax Compliance */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">10. Tax Compliance</h2>
                        <p>
                            You are responsible for paying applicable taxes on your earnings. NyasaWave will:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Track your income for tax reporting</p>
                            <p>• Provide earnings statements upon request</p>
                            <p>• Issue required tax documents (Form 1099 for US sellers)</p>
                        </div>
                        <p className="mt-3">
                            You must consult a tax professional regarding your tax obligations.
                        </p>
                    </section>

                    {/* 11. Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">11. Contact & Support</h2>
                        <p>
                            For questions about this agreement or seller support:
                        </p>
                        <p className="mt-3">
                            Email: sellers@nyasawave.com<br />
                            Support Portal: seller.nyasawave.com
                        </p>
                    </section>

                    {/* Legal */}
                    <div className="border-t border-zinc-700 pt-8 mt-12">
                        <p className="text-sm text-zinc-500">
                            © 2026 NyasaWave. This Seller Agreement is binding upon acceptance.
                            Continued use of seller features constitutes acceptance of all terms.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
