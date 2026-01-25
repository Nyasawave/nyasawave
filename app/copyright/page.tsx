'use client';

export default function CopyrightPage() {
    return (
        <div className="min-h-screen bg-black pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-4xl font-bold text-white mb-4">Copyright & DMCA Policy</h1>
                <p className="text-zinc-400 mb-12">Last updated: January 15, 2026</p>

                <div className="space-y-8 text-zinc-300">
                    {/* 1. Copyright Notice */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">1. Copyright Protection</h2>
                        <p>
                            NyasaWave respects intellectual property rights. All content on our platform—including
                            music, artwork, text, and videos—is protected by copyright law. Unauthorized reproduction,
                            distribution, or display is prohibited.
                        </p>
                        <p className="mt-3">
                            By uploading content to NyasaWave, you represent that you own or have the rights to all
                            uploaded material and that it does not infringe on third-party copyrights.
                        </p>
                    </section>

                    {/* 2. DMCA Process */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">2. DMCA Takedown Process</h2>
                        <p>
                            If you believe content on NyasaWave infringes your copyright, you can submit a
                            DMCA takedown notice. To be effective, your notice must include:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>1. Your name, address, email, and phone number</p>
                            <p>2. Description of the copyrighted work</p>
                            <p>3. Specific URL of the infringing content</p>
                            <p>4. Your good faith belief that use is not authorized</p>
                            <p>5. Statement that you are authorized to act on behalf of copyright holder</p>
                            <p>6. Your signature (physical or electronic)</p>
                            <p>7. Statement under penalty of perjury</p>
                        </div>
                        <p className="mt-3">
                            Submit DMCA notices to: copyright@nyasawave.com
                        </p>
                    </section>

                    {/* 3. Counter-Notice */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">3. Counter-Notice Process</h2>
                        <p>
                            If your content was removed due to DMCA takedown, you can submit a counter-notice:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>1. Your name, address, email, and phone</p>
                            <p>2. Identification of removed content and location</p>
                            <p>3. Statement under penalty of perjury that removal was in error</p>
                            <p>4. Your consent to jurisdiction of federal court</p>
                            <p>5. Your signature</p>
                        </div>
                        <p className="mt-3">
                            Submit counter-notices to: copyright@nyasawave.com
                        </p>
                    </section>

                    {/* 4. DMCA Timeline */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">4. DMCA Timeline</h2>
                        <div className="space-y-3">
                            <p><strong>Upon Receipt:</strong> We acknowledge receipt of valid DMCA notice</p>
                            <p><strong>24-48 Hours:</strong> We remove infringing content</p>
                            <p><strong>Creator Notification:</strong> We notify content creator of removal</p>
                            <p><strong>Counter-Notice:</strong> If submitted, we wait 10-14 days before restoring</p>
                            <p><strong>Restoration:</strong> Content restored unless legal action filed</p>
                        </div>
                    </section>

                    {/* 5. Repeated Infringement */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">5. Repeat Infringement Policy</h2>
                        <p>
                            Users who receive multiple DMCA takedowns may have their accounts terminated.
                            We follow the DMCA&apos;s repeat infringer policy to protect rights holders.
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• First violation: Warning and temporary suspension</p>
                            <p>• Second violation: Extended suspension</p>
                            <p>• Third violation: Permanent account termination</p>
                        </div>
                    </section>

                    {/* 6. Artist Rights */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">6. Artist Rights & Protection</h2>
                        <p>
                            NyasaWave protects artist intellectual property:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Artists retain copyright to their music</p>
                            <p>• Artists control distribution rights</p>
                            <p>• Artists can mark tracks as exclusive</p>
                            <p>• Artists can set licensing restrictions</p>
                            <p>• Artists can monetize their work</p>
                        </div>
                    </section>

                    {/* 7. Sampling & Remixing */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">7. Sampling & Remixing</h2>
                        <p>
                            If you sample or remix copyrighted music:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Credit the original artist</p>
                            <p>• Obtain permission from copyright holder</p>
                            <p>• Mark remix as derivative work</p>
                            <p>• Share revenue with original artist</p>
                        </div>
                        <p className="mt-3">
                            Unauthorized samples may be removed via DMCA.
                        </p>
                    </section>

                    {/* 8. Licensing & Permissions */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">8. Licensing & Permissions</h2>
                        <p>
                            To use copyrighted content commercially:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Contact the copyright holder directly</p>
                            <p>• Obtain written permission</p>
                            <p>• Agree on licensing terms and royalties</p>
                            <p>• Document all agreements</p>
                        </div>
                    </section>

                    {/* 9. False DMCA Claims */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">9. False DMCA Claims</h2>
                        <p>
                            Filing false DMCA notices is illegal and may result in:
                        </p>
                        <div className="space-y-2 ml-4 mt-3">
                            <p>• Account termination</p>
                            <p>• Legal action</p>
                            <p>• Liability for damages</p>
                            <p>• Criminal prosecution</p>
                        </div>
                    </section>

                    {/* 10. Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-3">10. Contact Copyright Team</h2>
                        <p>
                            For copyright issues:
                        </p>
                        <p className="mt-3">
                            Email: copyright@nyasawave.com<br />
                            Subject: [DMCA Takedown / Counter-Notice]<br />
                            Response time: 24-48 hours
                        </p>
                    </section>

                    {/* Footer */}
                    <div className="border-t border-zinc-700 pt-8 mt-12">
                        <p className="text-sm text-zinc-500">
                            © 2026 NyasaWave. We are committed to protecting both artist and copyright holder rights.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
