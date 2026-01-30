'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ExtendedSession } from '@/app/types/auth';

export default function MarketerEarningsPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const [earnings, setEarnings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !session.user?.roles?.includes('MARKETER')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const res = await fetch('/api/marketer/earnings');
                if (res.ok) {
                    const data = await res.json();
                    setEarnings(data);
                }
            } catch (error) {
                console.error('Error fetching earnings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading earnings...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Campaign Earnings</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900 rounded-lg p-6">
                    <p className="text-zinc-400 text-sm mb-2">Total Earned</p>
                    <p className="text-3xl font-bold">$0.00</p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-6">
                    <p className="text-zinc-400 text-sm mb-2">This Month</p>
                    <p className="text-3xl font-bold">$0.00</p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-6">
                    <p className="text-zinc-400 text-sm mb-2">Pending Payout</p>
                    <p className="text-3xl font-bold">$0.00</p>
                </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Earnings by Campaign</h2>
                <div className="text-zinc-400">
                    <p>No campaigns yet. Create your first campaign to start earning!</p>
                </div>
            </div>
        </div>
    );
}
