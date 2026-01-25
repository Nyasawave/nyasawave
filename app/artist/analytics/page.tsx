'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    EarningsChart,
    StreamsChart,
    DistrictChart,
    AgeGroupChart,
} from '../../components/AnalyticsCharts';
import { mockEarningsData } from '../../../data/mock-earnings';

export default function ArtistAnalytics() {
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState(mockEarningsData);
    const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

    if (!user || !user.roles?.includes('ARTIST')) {
        return (
            <main className="min-h-screen p-6 max-w-4xl mx-auto pt-32 text-center">
                <h1 className="text-3xl font-bold">Artist Only</h1>
                <p className="text-zinc-400 mt-4">This page is for artists only.</p>
                <Link
                    href="/artist/signin"
                    className="text-emerald-400 mt-6 inline-block hover:underline"
                >
                    Sign in as an artist
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-4xl font-bold">Analytics & Earnings</h1>
                            <p className="text-zinc-400 mt-2">Track your success on NyasaWave</p>
                        </div>
                        <Link
                            href="/artist/dashboard"
                            className="text-zinc-400 hover:text-white transition underline text-sm"
                        >
                            Back to Dashboard
                        </Link>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex gap-2">
                        {(['month', 'quarter', 'year'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg font-semibold transition ${timeRange === range
                                    ? 'bg-emerald-500 text-black'
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                    }`}
                            >
                                {range === 'month' ? 'This Month' : range === 'quarter' ? 'This Quarter' : 'This Year'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Total Earnings</p>
                        <p className="text-3xl font-bold mt-2 text-emerald-400">
                            MWK {data.totalEarnings.MWK.toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-500 mt-2">≈ USD {data.totalEarnings.USD.toFixed(2)}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Total Streams</p>
                        <p className="text-3xl font-bold mt-2">{data.totalStreams.toLocaleString()}</p>
                        <p className="text-xs text-zinc-500 mt-2">
                            ~{(data.totalEarnings.MWK / data.totalStreams).toFixed(2)} MWK/stream
                        </p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Engagement</p>
                        <p className="text-3xl font-bold mt-2">{data.totalLikes.toLocaleString()}</p>
                        <p className="text-xs text-zinc-500 mt-2">
                            {((data.totalLikes / data.totalStreams) * 100).toFixed(1)}% like rate
                        </p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Boost ROI</p>
                        <p className="text-3xl font-bold mt-2 text-pink-400">{data.boostROI.toFixed(1)}x</p>
                        <p className="text-xs text-zinc-500 mt-2">Return on boost spend</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Earnings Trend */}
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <h2 className="text-xl font-bold mb-6">Earnings Trend</h2>
                        <EarningsChart data={data.monthlyEarnings} />
                    </div>

                    {/* Streams Trend */}
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <h2 className="text-xl font-bold mb-6">Stream Volume</h2>
                        <StreamsChart data={data.monthlyEarnings} />
                    </div>

                    {/* District Breakdown */}
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <h2 className="text-xl font-bold mb-6">🗺️ Where You're Heard (Districts)</h2>
                        <DistrictChart data={data.districtBreakdown} />
                    </div>

                    {/* Age Demographics */}
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <h2 className="text-xl font-bold mb-6">Listener Age Groups</h2>
                        <AgeGroupChart data={data.audienceDemographics.ageGroups} />
                    </div>
                </div>

                {/* Earnings Breakdown */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-12">
                    <h2 className="text-xl font-bold mb-6">Earnings Breakdown</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                            <p className="text-zinc-400 text-sm">From Streams</p>
                            <p className="text-2xl font-bold mt-2 text-blue-400">
                                MWK {data.earnings_breakdown.streams.MWK.toLocaleString()}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                {((data.earnings_breakdown.streams.MWK / data.totalEarnings.MWK) * 100).toFixed(0)}% of total
                            </p>
                        </div>
                        <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                            <p className="text-zinc-400 text-sm">From Boosts</p>
                            <p className="text-2xl font-bold mt-2 text-pink-400">
                                MWK {data.earnings_breakdown.boosts.MWK.toLocaleString()}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                {((data.earnings_breakdown.boosts.MWK / data.totalEarnings.MWK) * 100).toFixed(0)}% of total
                            </p>
                        </div>
                        <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                            <p className="text-zinc-400 text-sm">From Marketplace</p>
                            <p className="text-2xl font-bold mt-2 text-purple-400">
                                MWK {data.earnings_breakdown.marketplace.MWK.toLocaleString()}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                {((data.earnings_breakdown.marketplace.MWK / data.totalEarnings.MWK) * 100).toFixed(0)}% of total
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Performing Songs */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-12">
                    <h2 className="text-xl font-bold mb-6">Top Performing Tracks</h2>
                    <div className="space-y-4">
                        {data.songEarnings.map((song) => (
                            <div key={song.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-lg">{song.title}</h3>
                                        <p className="text-xs text-zinc-500">{song.genre} • Released {new Date(song.releasedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-400">MWK {song.earnings.MWK.toLocaleString()}</p>
                                        <p className="text-xs text-zinc-500">{song.streams.toLocaleString()} streams</p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-4 gap-4 text-xs">
                                    <div>
                                        <p className="text-zinc-500">Likes</p>
                                        <p className="text-white font-semibold">{song.likes.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500">Boost ROI</p>
                                        <p className="text-pink-400 font-semibold">
                                            {song.boostEarnings.MWK > 0
                                                ? `${((song.boostEarnings.MWK / (song.earnings.MWK - song.boostEarnings.MWK)) * 100).toFixed(0)}%`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500">Boosts Used</p>
                                        <p className="text-white font-semibold">{song.boosts}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500">Engagement Rate</p>
                                        <p className="text-white font-semibold">{((song.likes / song.streams) * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-12">
                    <h2 className="text-xl font-bold mb-6">Streams by Device</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {data.audienceDemographics.topDevices.map((device) => (
                            <div key={device.device} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                                <p className="text-zinc-400 text-sm">{device.device}</p>
                                <p className="text-2xl font-bold mt-2">{device.percentage}%</p>
                                <p className="text-xs text-zinc-500 mt-1">{device.streams.toLocaleString()} streams</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Boost History */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                    <h2 className="text-xl font-bold mb-6">Recent Boosts & ROI</h2>
                    <div className="space-y-3">
                        {data.boostHistory.map((boost) => {
                            const song = data.songEarnings.find((s) => s.id === boost.songId);
                            return (
                                <div key={boost.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{song?.title || 'Unknown'}</p>
                                            <p className="text-xs text-zinc-400">
                                                {boost.type} • {boost.duration}h boost
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-pink-400">MWK {boost.cost.MWK.toLocaleString()}</p>
                                            <p className="text-xs text-zinc-500">{boost.playsGenerated.toLocaleString()} plays generated</p>
                                            <p className="text-xs text-emerald-400 mt-1">ROI: +{boost.roi}%</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
}
