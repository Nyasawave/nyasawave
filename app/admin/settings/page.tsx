'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !(session.user as any).roles?.includes('ADMIN')) {
            router.push('/unauthorized');
        }
        setLoading(false);
    }, [session, router]);

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Platform Settings</h1>

            <div className="grid gap-6">
                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">System Configuration</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Platform name: Nyasawave</p>
                        <p>• Domain configuration</p>
                        <p>• Maintenance mode</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Payment Settings</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Commission rates</p>
                        <p>• Payout frequency</p>
                        <p>• Currency configuration</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Moderation</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Content policies</p>
                        <p>• Flagging automation</p>
                        <p>• Ban management</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Email & Notifications</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Email templates</p>
                        <p>• Notification preferences</p>
                        <p>• Alert thresholds</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
