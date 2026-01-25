'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EntrepreneurBusinessesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !(session.user as any).roles?.includes('ENTREPRENEUR')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const res = await fetch('/api/entrepreneur/businesses');
                if (res.ok) {
                    const data = await res.json();
                    setBusinesses(data);
                }
            } catch (error) {
                console.error('Error fetching businesses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading businesses...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Businesses</h1>
                <button className="px-6 py-2 bg-green-500 text-black rounded-full font-semibold hover:bg-green-600 transition-colors">
                    + New Business
                </button>
            </div>

            {businesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {businesses.map(business => (
                        <div key={business.id} className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors cursor-pointer">
                            <h3 className="text-lg font-semibold mb-2">{business.name}</h3>
                            <p className="text-zinc-400 text-sm mb-4">{business.category}</p>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Revenue: ${business.revenue || 0}</span>
                                <span className={`font-semibold ${business.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {business.status || 'active'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-zinc-900 rounded-lg p-8 text-center">
                    <p className="text-zinc-400 mb-4">You don't have any businesses yet.</p>
                    <button className="px-6 py-2 bg-green-500 text-black rounded-full font-semibold hover:bg-green-600 transition-colors">
                        Create Your First Business
                    </button>
                </div>
            )}
        </div>
    );
}
