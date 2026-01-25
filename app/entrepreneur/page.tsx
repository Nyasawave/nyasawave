'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function EntrepreneurPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !session.user.roles?.includes('ENTREPRENEUR')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const response = await fetch("/api/entrepreneur/businesses");
                if (response.ok) {
                    const data = await response.json();
                    setBusinesses(data.businesses || []);
                }
            } catch (error) {
                console.error("Failed to fetch businesses:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.roles?.includes('ENTREPRENEUR')) {
            fetchBusinesses();
        }
    }, [session]);

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Business Dashboard</h1>
                    <Link
                        href="/entrepreneur/create"
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                    >
                        Create Business
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Total Businesses</h3>
                        <p className="text-3xl font-bold text-white">{businesses.length}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Active Listings</h3>
                        <p className="text-3xl font-bold text-white">0</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Revenue</h3>
                        <p className="text-3xl font-bold text-white">$0</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Loading businesses...</p>
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="bg-zinc-900 rounded-lg p-12 text-center">
                        <p className="text-zinc-400 mb-4">You haven't created any businesses yet</p>
                        <Link
                            href="/entrepreneur/create"
                            className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                        >
                            Create Your First Business
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {businesses.map((business: any) => (
                            <div key={business.id} className="bg-zinc-900 rounded-lg p-4">
                                <h3 className="text-white font-semibold">{business.name}</h3>
                                <p className="text-zinc-400 text-sm">{business.industry}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
