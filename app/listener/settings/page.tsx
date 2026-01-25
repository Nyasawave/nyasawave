'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ListenerSettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !(session.user as any).roles?.includes('LISTENER')) {
            router.push('/unauthorized');
        }
        setLoading(false);
    }, [session, router]);

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Listener Settings</h1>

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
                    <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Audio quality</p>
                        <p>• Autoplay settings</p>
                        <p>• Recommendations</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Privacy</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Profile visibility</p>
                        <p>• Activity status</p>
                        <p>• Data collection</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Email notifications</p>
                        <p>• Push notifications</p>
                        <p>• In-app alerts</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
