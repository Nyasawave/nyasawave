'use client';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
                <p className="text-zinc-400 mb-12">Last updated: January 15, 2026</p>

                <div className="space-y-8 text-zinc-300">
                    {/* 1. Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
                        <p>
                            NyasaWave (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Company&quot;) operates the NyasaWave platform.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                            when you visit our website and use our services.
                        </p>
                    </section>

                    {/* 2. Information We Collect */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">2. Information We Collect</h2>
                        <div className="space-y-3">
                            <div>
                                <h3 className="font-semibold text-white mb-2">Personal Data</h3>
                                <p>• Name</p>
                                <p>• Email address</p>
                                <p>• Password (hashed)</p>
                                <p>• Phone number (for verification)</p>
                                <p>• Profile information</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-2">Usage Data</h3>
                                <p>• IP address</p>
                                <p>• Browser type</p>
                                <p>• Pages visited</p>
                                <p>• Time spent on pages</p>
                                <p>• Referring website</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-2">KYC Data (Optional)</h3>
                                <p>• Government-issued ID</p>
                                <p>• Date of birth</p>
                                <p>• Address</p>
                                <p>• Bank account information (for payouts)</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. How We Use Your Information */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">3. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Provide and maintain the Service</p>
                            <p>• Process transactions and send related information</p>
                            <p>• Send promotional communications (with your consent)</p>
                            <p>• Respond to your comments, questions, and requests</p>
                            <p>• Monitor and analyze usage patterns and trends</p>
                            <p>• Detect, investigate, and prevent fraudulent transactions</p>
                            <p>• Comply with legal obligations</p>
                        </div>
                    </section>

                    {/* 4. Data Retention */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">4. Data Retention</h2>
                        <p>
                            We retain your personal data for as long as your account is active or as needed to provide
                            services. You can request deletion of your account at any time, which will delete personal
                            data within 30 days (except where legally required to retain).
                        </p>
                    </section>

                    {/* 5. Data Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">5. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal
                            data against unauthorized access, alteration, disclosure, or destruction. However, no
                            method of transmission over the Internet is 100% secure.
                        </p>
                        <p className="mt-3">Security measures include:</p>
                        <div className="space-y-2 ml-4 mt-2">
                            <p>• Encryption of sensitive data</p>
                            <p>• Password hashing (bcryptjs)</p>
                            <p>• Secure HTTPS connections</p>
                            <p>• Regular security audits</p>
                        </div>
                    </section>

                    {/* 6. Cookies and Tracking */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">6. Cookies and Tracking</h2>
                        <p>
                            We use cookies to remember your preferences and authenticate your sessions. You can
                            control cookies through your browser settings. Disabling cookies may affect service functionality.
                        </p>
                    </section>

                    {/* 7. Third-Party Services */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">7. Third-Party Services</h2>
                        <p>
                            We use third-party service providers for payment processing (Stripe, Flutterwave),
                            analytics, and hosting. These providers have their own privacy policies. We encourage
                            you to review their policies.
                        </p>
                    </section>

                    {/* 8. Your Privacy Rights */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">8. Your Privacy Rights</h2>
                        <p>Depending on your location, you may have the following rights:</p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• <strong>GDPR (EU):</strong> Right to access, rectify, erase, restrict, and data portability</p>
                            <p>• <strong>CCPA (California):</strong> Right to know, delete, and opt-out of sales</p>
                            <p>• <strong>General:</strong> Right to withdraw consent and lodge complaints</p>
                        </div>
                        <p className="mt-3">
                            To exercise these rights, contact us at privacy@nyasawave.com.
                        </p>
                    </section>

                    {/* 9. Children's Privacy */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">9. Children's Privacy</h2>
                        <p>
                            Our Service is not intended for children under 13. We do not knowingly collect personal
                            data from children. If we become aware of such collection, we will delete the information
                            and terminate the account.
                        </p>
                    </section>

                    {/* 10. International Transfers */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">10. International Transfers</h2>
                        <p>
                            Your information may be transferred to, stored in, and processed in countries other than
                            your country of residence. These countries may have data protection laws that differ from
                            your home country.
                        </p>
                    </section>

                    {/* 11. Contact Us */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">11. Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy or our privacy practices:
                        </p>
                        <p className="mt-3">
                            Email: privacy@nyasawave.com<br />
                            Address: Lilongwe, Malawi
                        </p>
                    </section>

                    {/* Updates */}
                    <div className="border-t border-zinc-700 pt-8 mt-12">
                        <p className="text-sm text-zinc-500">
                            © 2026 NyasaWave. This Privacy Policy may be updated at any time. Changes will be
                            posted to this page with an updated revision date.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
