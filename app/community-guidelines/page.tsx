'use client';

export default function CommunityGuidelinesPage() {
    return (
        <div className="min-h-screen bg-black pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-4xl font-bold text-white mb-4">Community Guidelines</h1>
                <p className="text-zinc-400 mb-12">Last updated: January 15, 2026</p>

                <div className="space-y-8 text-zinc-300">
                    {/* 1. Our Community */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">1. Our Community</h2>
                        <p>
                            NyasaWave is a global music and marketplace community. We strive to create a safe,
                            respectful, and inclusive space where artists, creators, and fans can connect. These
                            guidelines ensure everyone can enjoy the platform responsibly.
                        </p>
                    </section>

                    {/* 2. Respectful Behavior */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">2. Respectful Behavior</h2>
                        <p>Treat all users with respect. This means:</p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• No harassment, bullying, or intimidation</p>
                            <p>• No threats of violence or harm</p>
                            <p>• Respect diverse opinions and backgrounds</p>
                            <p>• Use constructive language in comments and messages</p>
                            <p>• Don't impersonate others or misrepresent your identity</p>
                        </div>
                    </section>

                    {/* 3. No Hate Speech */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">3. No Hate Speech or Discrimination</h2>
                        <p>
                            We do not tolerate content that attacks individuals or groups based on:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Race, ethnicity, or national origin</p>
                            <p>• Religion or belief system</p>
                            <p>• Gender or gender identity</p>
                            <p>• Sexual orientation</p>
                            <p>• Disability or medical condition</p>
                            <p>• Age</p>
                        </div>
                        <p className="mt-3">
                            Hate speech will result in account suspension or permanent ban.
                        </p>
                    </section>

                    {/* 4. No Spam or Manipulation */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">4. No Spam or Manipulation</h2>
                        <p>Prohibited practices include:</p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Posting repetitive content to artificially inflate engagement</p>
                            <p>• Using bots to generate fake streams or likes</p>
                            <p>• Purchasing fake followers or engagement</p>
                            <p>• Creating multiple accounts to boost metrics</p>
                            <p>• Misleading advertising or false claims</p>
                            <p>• Unsolicited advertising or promotion</p>
                        </div>
                        <p className="mt-3">
                            Detected manipulation will result in removal of fake engagement and account penalties.
                        </p>
                    </section>

                    {/* 5. Intellectual Property */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">5. Respect Intellectual Property</h2>
                        <p>
                            Do not upload, share, or claim ownership of content you don't have rights to:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Don't re-upload music you don't own</p>
                            <p>• Don't claim someone else's artwork as your own</p>
                            <p>• Don't use samples without proper licensing</p>
                            <p>• Don't remix music without attribution</p>
                            <p>• Properly credit collaborators and samples</p>
                        </div>
                    </section>

                    {/* 6. No Adult or Explicit Content */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">6. Content Standards</h2>
                        <p>The following content is prohibited:</p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Sexually explicit or pornographic material</p>
                            <p>• Graphic violence or gore</p>
                            <p>• Drug use promotion</p>
                            <p>• Child exploitation (automatic reporting to authorities)</p>
                            <p>• Illegal weapons or explosives</p>
                        </div>
                        <p className="mt-3">
                            Explicit music is allowed but must be properly tagged as "Explicit" for parental controls.
                        </p>
                    </section>

                    {/* 7. No Illegal Activity */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">7. No Illegal Activity</h2>
                        <p>
                            Do not use NyasaWave to engage in, promote, or facilitate any illegal activity including:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Fraud or financial crimes</p>
                            <p>• Money laundering</p>
                            <p>• Drug trafficking</p>
                            <p>• Human trafficking or exploitation</p>
                            <p>• Terrorism or extremism</p>
                        </div>
                        <p className="mt-3">
                            We report suspected illegal activity to law enforcement.
                        </p>
                    </section>

                    {/* 8. Privacy & Data */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">8. Respect Privacy & Data</h2>
                        <p>
                            Do not share others' personal information without consent:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• No doxxing (sharing personal information)</p>
                            <p>• No publishing private messages without consent</p>
                            <p>• No harvesting email addresses or data</p>
                            <p>• No recording sessions without permission</p>
                        </div>
                    </section>

                    {/* 9. Reporting Violations */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">9. How to Report Violations</h2>
                        <p>
                            If you encounter content or behavior that violates these guidelines:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>1. Click "Report" on the content or profile</p>
                            <p>2. Select the violation type</p>
                            <p>3. Provide details or screenshots</p>
                            <p>4. Submit your report</p>
                        </div>
                        <p className="mt-3">
                            Our moderation team reviews reports within 24 hours. Urgent safety concerns can be
                            emailed to safety@nyasawave.com.
                        </p>
                    </section>

                    {/* 10. Enforcement */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">10. Enforcement & Penalties</h2>
                        <p>
                            Violations are handled progressively:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p><strong>First offense:</strong> Warning and content removal</p>
                            <p><strong>Second offense:</strong> Temporary suspension (24-72 hours)</p>
                            <p><strong>Third offense:</strong> Long-term suspension (30 days)</p>
                            <p><strong>Severe violations:</strong> Permanent ban (no appeal)</p>
                        </div>
                        <p className="mt-3">
                            Severe violations (hate speech, exploitation, illegal activity) may result in
                            immediate permanent ban and law enforcement notification.
                        </p>
                    </section>

                    {/* 11. Appeals */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">11. Appeal Process</h2>
                        <p>
                            If you believe your content was wrongfully removed or account suspended:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>1. Email appeals@nyasawave.com within 30 days</p>
                            <p>2. Explain why you believe the action was incorrect</p>
                            <p>3. Provide supporting evidence</p>
                            <p>4. We will review and respond within 7 days</p>
                        </div>
                    </section>

                    {/* 12. Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">12. Questions?</h2>
                        <p>
                            For questions about these guidelines:
                        </p>
                        <p className="mt-3">
                            Email: community@nyasawave.com<br />
                            Support: support.nyasawave.com
                        </p>
                    </section>

                    {/* Legal */}
                    <div className="border-t border-zinc-700 pt-8 mt-12">
                        <p className="text-sm text-zinc-500">
                            © 2026 NyasaWave. These guidelines are enforceable rules of platform conduct.
                            We reserve the right to update them at any time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
