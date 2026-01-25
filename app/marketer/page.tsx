'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MarketerPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !session.user.roles?.includes('MARKETER')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await fetch("/api/marketer/campaigns");
                if (response.ok) {
                    const data = await response.json();
                    setCampaigns(data.campaigns || []);
                }
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.roles?.includes('MARKETER')) {
            fetchCampaigns();
        }
    }, [session]);

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Marketing Dashboard</h1>
                    <Link
                        href="/marketer/campaigns/create"
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                    >
                        Create Campaign
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Active Campaigns</h3>
                        <p className="text-3xl font-bold text-white">{campaigns.length}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Total Reach</h3>
                        <p className="text-3xl font-bold text-white">0</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Conversions</h3>
                        <p className="text-3xl font-bold text-white">0</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Total Earnings</h3>
                        <p className="text-3xl font-bold text-white">$0</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Loading campaigns...</p>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="bg-zinc-900 rounded-lg p-12 text-center">
                        <p className="text-zinc-400 mb-4">You haven't created any campaigns yet</p>
                        <Link
                            href="/marketer/campaigns/create"
                            className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                        >
                            Create Your First Campaign
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {campaigns.map((campaign: any) => (
                            <div key={campaign.id} className="bg-zinc-900 rounded-lg p-4">
                                <h3 className="text-white font-semibold">{campaign.title}</h3>
                                <p className="text-zinc-400 text-sm">Status: {campaign.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
