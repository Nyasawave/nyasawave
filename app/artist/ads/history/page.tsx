'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { MOCK_ACTIVE_ADS, MOCK_EXPIRED_ADS } from '../../../../lib/mockAds';
import type { ExtendedSession } from '@/app/types/auth';

export default function AdHistory() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const user = session?.user;
    const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

    if (!user || !user.roles?.includes('ARTIST')) {
        return (
            <main className="min-h-screen p-6 max-w-4xl mx-auto pt-32 text-center">
                <h1 className="text-3xl font-bold">Artist Only</h1>
                <p className="text-zinc-400 mt-4">This page is for artists only.</p>
                <Link href="/artist/signin" className="text-emerald-400 mt-6 inline-block hover:underline">
                    Sign in as an artist
                </Link>
            </main>
        );
    }

    const displayAds = activeTab === 'active' ? MOCK_ACTIVE_ADS : MOCK_EXPIRED_ADS;

    const calculateEarnings = (ad: typeof MOCK_ACTIVE_ADS[0]) => {
        // Simple calculation: conversions * average value
        const avgValue = ad.budgetMWK / 30; // Spread budget over estimated 30-day period
        return Math.round(ad.conversions * (avgValue / 100));
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12">
                    <Link href="/artist/dashboard" className="text-emerald-400 text-sm hover:underline mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold">Ad Campaign History</h1>
                    <p className="text-zinc-400 mt-2">Track your ad performance and analytics</p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Total Impressions</p>
                        <p className="text-3xl font-bold mt-2">
                            {(MOCK_ACTIVE_ADS.reduce((sum, ad) => sum + ad.impressions, 0) + MOCK_EXPIRED_ADS.reduce((sum, ad) => sum + ad.impressions, 0)).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Total Clicks</p>
                        <p className="text-3xl font-bold mt-2">
                            {(MOCK_ACTIVE_ADS.reduce((sum, ad) => sum + ad.clicks, 0) + MOCK_EXPIRED_ADS.reduce((sum, ad) => sum + ad.clicks, 0)).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Total Conversions</p>
                        <p className="text-3xl font-bold mt-2">
                            {(MOCK_ACTIVE_ADS.reduce((sum, ad) => sum + ad.conversions, 0) + MOCK_EXPIRED_ADS.reduce((sum, ad) => sum + ad.conversions, 0)).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Avg ROI</p>
                        <p className="text-3xl font-bold mt-2 text-emerald-400">3.2x</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mb-8 border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`pb-4 font-semibold transition ${activeTab === 'active'
                            ? 'text-emerald-400 border-b-2 border-emerald-400'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Active Campaigns ({MOCK_ACTIVE_ADS.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('expired')}
                        className={`pb-4 font-semibold transition ${activeTab === 'expired'
                            ? 'text-emerald-400 border-b-2 border-emerald-400'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Expired Campaigns ({MOCK_EXPIRED_ADS.length})
                    </button>
                </div>

                {/* Campaign Cards */}
                <div className="space-y-6">
                    {displayAds.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-zinc-400 mb-4">No {activeTab} campaigns yet</p>
                            <Link href="/artist/ads" className="text-emerald-400 hover:underline">
                                Create your first ad campaign →
                            </Link>
                        </div>
                    ) : (
                        displayAds.map((ad) => (
                            <div key={ad.id} className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 hover:border-zinc-700 transition">
                                <div className="grid md:grid-cols-4 gap-8">
                                    {/* Image */}
                                    <div className="md:col-span-1">
                                        <img
                                            src={ad.imageUrl}
                                            alt={ad.title}
                                            className="w-full h-48 rounded-lg object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold">{ad.title}</h3>
                                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${ad.status === 'ACTIVE'
                                                    ? 'bg-emerald-900 text-emerald-300'
                                                    : ad.status === 'EXPIRED'
                                                        ? 'bg-zinc-800 text-zinc-400'
                                                        : 'bg-amber-900 text-amber-300'
                                                    }`}>
                                                    {ad.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-400">{ad.description}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-zinc-400">Campaign Dates</p>
                                                <p className="font-semibold">
                                                    {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-400">Placement</p>
                                                <p className="font-semibold">{ad.placement}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
                                        <h4 className="font-semibold mb-4">Performance</h4>
                                        <div className="space-y-4 text-sm">
                                            <div>
                                                <p className="text-zinc-400">Impressions</p>
                                                <p className="text-xl font-bold text-emerald-400">
                                                    {ad.impressions.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-400">Clicks</p>
                                                <p className="text-xl font-bold">
                                                    {ad.clicks.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    CTR: {((ad.clicks / ad.impressions) * 100).toFixed(2)}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-400">Conversions</p>
                                                <p className="text-xl font-bold">
                                                    {ad.conversions.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="border-t border-zinc-700 pt-4">
                                                <p className="text-zinc-400">ROI</p>
                                                <p className="text-lg font-bold text-emerald-400">
                                                    {ad.roi.toFixed(1)}x
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
