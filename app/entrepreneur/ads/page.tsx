'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EntrepreneurAdsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !(session.user as any).roles?.includes('ENTREPRENEUR')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const res = await fetch('/api/entrepreneur/ads');
                if (res.ok) {
                    const data = await res.json();
                    setAds(data);
                }
            } catch (error) {
                console.error('Error fetching ads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading ads...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Ads</h1>
                <button className="px-6 py-2 bg-green-500 text-black rounded-full font-semibold hover:bg-green-600 transition-colors">
                    + Create Ad
                </button>
            </div>

            {ads.length > 0 ? (
                <div className="space-y-4">
                    {ads.map(ad => (
                        <div key={ad.id} className="bg-zinc-900 rounded-lg p-6 flex justify-between items-center hover:bg-zinc-800 transition-colors">
                            <div>
                                <h3 className="text-lg font-semibold">{ad.title}</h3>
                                <p className="text-sm text-zinc-400">Budget: ${ad.budget}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-zinc-400">{ad.impressions || 0} impressions</p>
                                <p className={`text-sm font-semibold ${ad.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {ad.status || 'active'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-zinc-900 rounded-lg p-8 text-center">
                    <p className="text-zinc-400 mb-4">You haven't created any ads yet.</p>
                    <button className="px-6 py-2 bg-green-500 text-black rounded-full font-semibold hover:bg-green-600 transition-colors">
                        Create Your First Ad
                    </button>
                </div>
            )}
        </div>
    );
}
