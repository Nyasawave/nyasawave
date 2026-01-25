'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ArtistSettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !(session.user as any).roles?.includes('ARTIST')) {
            router.push('/unauthorized');
        }
        setLoading(false);
    }, [session, router]);

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Artist Settings</h1>

            <div className="grid gap-6">
                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Profile</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Artist name</p>
                        <p>• Bio and description</p>
                        <p>• Profile image</p>
                        <p>• Cover art</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Account</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Email address</p>
                        <p>• Password</p>
                        <p>• Two-factor authentication</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Payment Info</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Bank account</p>
                        <p>• Withdrawal frequency</p>
                        <p>• Tax information</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Distribution</h2>
                    <div className="space-y-4 text-zinc-400">
                        <p>• Track distribution settings</p>
                        <p>• Metadata preferences</p>
                        <p>• Royalty splits</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
