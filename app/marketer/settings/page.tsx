'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MarketerSettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !(session.user as any).roles?.includes('MARKETER')) {
            router.push('/unauthorized');
        }
        setLoading(false);
    }, [session, router]);

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Marketer Settings</h1>

            <div className="grid gap-6">
                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Account</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Email address</p>
                        <p>• Password</p>
                        <p>• Two-factor authentication</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Company Info</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Company name</p>
                        <p>• Tax ID</p>
                        <p>• Business address</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Payment</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Bank account</p>
                        <p>• Withdrawal preferences</p>
                        <p>• Budget limits</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Campaign Settings</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Default audience</p>
                        <p>• Budget allocation</p>
                        <p>• Campaign templates</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
