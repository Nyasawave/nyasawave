'use client';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
                <p className="text-zinc-400 mb-12">Last updated: January 15, 2026</p>

                <div className="space-y-8 text-zinc-300">
                    {/* 1. Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
                        <p>
                            Welcome to NyasaWave (&quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms of Service
                            (&quot;Terms&quot;) govern your access to and use of the NyasaWave platform, including all content, features,
                            and services offered.
                        </p>
                        <p className="mt-3">
                            By accessing or using NyasaWave, you agree to be bound by these Terms. If you do not agree to abide
                            by the above, please do not use this service.
                        </p>
                    </section>

                    {/* 2. User Responsibilities */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">2. User Responsibilities</h2>
                        <div className="space-y-2 ml-4">
                            <p>• You are responsible for maintaining the confidentiality of your account credentials</p>
                            <p>• You agree to provide accurate and complete information during registration</p>
                            <p>• You are responsible for all activity under your account</p>
                            <p>• You agree to notify us immediately of unauthorized account use</p>
                            <p>• You must be at least 13 years old to use this service</p>
                        </div>
                    </section>

                    {/* 3. Prohibited Content */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">3. Prohibited Content</h2>
                        <p>You agree not to upload, post, or share any content that:</p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Infringes on intellectual property rights</p>
                            <p>• Contains hate speech, violence, or harassment</p>
                            <p>• Is illegal or promotes illegal activity</p>
                            <p>• Is sexually explicit or exploitative</p>
                            <p>• Contains malware or viruses</p>
                            <p>• Is spam or misleading</p>
                            <p>• Violates anyone&apos;s privacy or rights</p>
                        </div>
                    </section>

                    {/* 4. Intellectual Property */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">4. Intellectual Property Rights</h2>
                        <p>
                            By uploading content to NyasaWave, you retain ownership of your content. You grant NyasaWave
                            a non-exclusive, worldwide, royalty-free license to display, distribute, and promote your content.
                        </p>
                        <p className="mt-3">
                            You represent and warrant that you own or have rights to all content you upload, and that
                            your content does not violate third-party rights.
                        </p>
                    </section>

                    {/* 5. Payment Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">5. Payment Terms</h2>
                        <div className="space-y-2 ml-4">
                            <p>• Subscription fees are charged in advance</p>
                            <p>• Billing occurs at the beginning of each billing period</p>
                            <p>• Cancellation takes effect at end of current billing period</p>
                            <p>• Refunds are issued within 14 days of cancellation</p>
                            <p>• We reserve the right to change pricing with 30 days notice</p>
                        </div>
                    </section>

                    {/* 6. Disclaimer of Warranties */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">6. Disclaimer of Warranties</h2>
                        <p>
                            NyasaWave is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We disclaim
                            all warranties, express or implied, including but not limited to merchantability, fitness
                            for a particular purpose, and non-infringement.
                        </p>
                    </section>

                    {/* 7. Limitation of Liability */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">7. Limitation of Liability</h2>
                        <p>
                            In no event shall NyasaWave, its directors, employees, or agents be liable for any
                            indirect, incidental, special, consequential, or punitive damages arising from your use
                            of the service.
                        </p>
                    </section>

                    {/* 8. Account Termination */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">8. Account Termination</h2>
                        <p>
                            We reserve the right to terminate or suspend your account at any time for violating
                            these Terms or for any reason. Upon termination, your access will be revoked immediately.
                        </p>
                    </section>

                    {/* 9. Changes to Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">9. Changes to Terms</h2>
                        <p>
                            We may modify these Terms at any time. Changes will be effective immediately upon posting.
                            Your continued use constitutes acceptance of the updated Terms.
                        </p>
                    </section>

                    {/* 10. Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">10. Contact Us</h2>
                        <p>
                            If you have questions about these Terms, please contact us at:
                        </p>
                        <p className="mt-3">
                            Email: support@nyasawave.com<br />
                            Address: Lilongwe, Malawi
                        </p>
                    </section>

                    {/* Legal */}
                    <div className="border-t border-zinc-700 pt-8 mt-12">
                        <p className="text-sm text-zinc-500">
                            © 2026 NyasaWave. All rights reserved. These Terms of Service constitute the entire
                            agreement between you and NyasaWave regarding your use of the Service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
