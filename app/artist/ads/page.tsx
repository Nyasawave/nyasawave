'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useState, useEffect } from 'react';
import { MOCK_AD_SLOTS } from '@/lib/mockAds';

interface FormData {
    title: string;
    description: string;
    budget: number;
    startDate: string;
    endDate: string;
    targetGenre: string;
    targetAudience: string;
}

interface Ad {
    id: string;
    artistId: string;
    title: string;
    description: string;
    budget: number;
    spent: number;
    startDate: string;
    endDate: string;
    targetGenre: string;
    targetAudience: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    clickCount: number;
    impressionCount: number;
    createdAt: string;
}

export default function CreateAd() {
    const { user, token } = useAuth();
    const [tab, setTab] = useState<'create' | 'manage'>('create');
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        budget: 100,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        targetGenre: 'all',
        targetAudience: 'all',
    });
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [adsLoading, setAdsLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch ads on mount and when tab changes
    useEffect(() => {
        if (user && user.roles?.includes('ARTIST') && token && tab === 'manage') {
            fetchAds();
        }
    }, [user, token, tab]);

    const fetchAds = async () => {
        setAdsLoading(true);
        try {
            const response = await fetch('/api/artist/ads', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch ads');
            const data = await response.json();
            setAds(data.ads || []);
        } catch (err) {
            setError('Failed to load ads');
            console.error(err);
        } finally {
            setAdsLoading(false);
        }
    };

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

    const selectedSlot = MOCK_AD_SLOTS[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.budget) {
            alert('Please fill in all required fields');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/artist/ads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create ad');
            }

            setSuccess(true);
            setFormData({
                title: '',
                description: '',
                budget: 100,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                targetGenre: 'all',
                targetAudience: 'all',
            });
            setTimeout(() => setSuccess(false), 3000);
            // Refresh ads list
            if (token) fetchAds();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create ad');
        } finally {
            setLoading(false);
        }
    };

    const handleAdAction = async (adId: string, action: string) => {
        try {
            const response = await fetch('/api/artist/ads', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ adId, action }),
            });

            if (!response.ok) throw new Error('Failed to update ad');
            fetchAds();
        } catch (err) {
            setError('Failed to update ad');
            console.error(err);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12">
                    <Link href="/artist/dashboard" className="text-emerald-400 text-sm hover:underline mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold">Manage Campaigns</h1>
                    <p className="text-zinc-400 mt-2">Create and monitor advertising campaigns to grow your audience</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-zinc-800">
                    <button
                        onClick={() => setTab('create')}
                        className={`px-6 py-3 font-semibold transition border-b-2 ${tab === 'create'
                            ? 'border-emerald-400 text-emerald-400'
                            : 'border-transparent text-zinc-400 hover:text-white'
                            }`}
                    >
                        Create Campaign
                    </button>
                    <button
                        onClick={() => setTab('manage')}
                        className={`px-6 py-3 font-semibold transition border-b-2 ${tab === 'manage'
                            ? 'border-emerald-400 text-emerald-400'
                            : 'border-transparent text-zinc-400 hover:text-white'
                            }`}
                    >
                        My Campaigns
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-100 px-6 py-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Create Tab */}
                {tab === 'create' && (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {success && (
                            <div className="bg-emerald-900 border border-emerald-700 text-emerald-100 px-6 py-4 rounded-lg mb-6">
                                Campaign created successfully!
                            </div>
                        )}

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Left: Form */}
                            <div className="md:col-span-2 space-y-8">
                                {/* Campaign Details */}
                                <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                                    <h2 className="text-xl font-bold mb-6">Campaign Details</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-semibold mb-2">Campaign Title *</label>
                                            <input
                                                id="title"
                                                type="text"
                                                placeholder="e.g., Summer Album Release"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-400"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-semibold mb-2">Description</label>
                                            <textarea
                                                id="description"
                                                placeholder="Describe your campaign..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-400"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="budget" className="block text-sm font-semibold mb-2">Budget (USD) *</label>
                                            <input
                                                id="budget"
                                                type="number"
                                                min={10}
                                                step={10}
                                                value={formData.budget}
                                                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                                className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-400"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dates & Targeting */}
                                <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                                    <h2 className="text-xl font-bold mb-6">Dates & Targeting</h2>
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="start" className="block text-sm font-semibold mb-2">Start Date *</label>
                                                <input
                                                    id="start"
                                                    type="date"
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-400"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="end" className="block text-sm font-semibold mb-2">End Date *</label>
                                                <input
                                                    id="end"
                                                    type="date"
                                                    value={formData.endDate}
                                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-400"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="genre" className="block text-sm font-semibold mb-2">Target Genre</label>
                                                <select
                                                    id="genre"
                                                    value={formData.targetGenre}
                                                    onChange={(e) => setFormData({ ...formData, targetGenre: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-400"
                                                >
                                                    <option value="all">All Genres</option>
                                                    <option value="pop">Pop</option>
                                                    <option value="hip-hop">Hip-Hop</option>
                                                    <option value="rnb">R&B</option>
                                                    <option value="rock">Rock</option>
                                                    <option value="electronic">Electronic</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="audience" className="block text-sm font-semibold mb-2">Target Audience</label>
                                                <select
                                                    id="audience"
                                                    value={formData.targetAudience}
                                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-emerald-400"
                                                >
                                                    <option value="all">All Audiences</option>
                                                    <option value="18-25">18-25</option>
                                                    <option value="26-35">26-35</option>
                                                    <option value="36-50">36-50</option>
                                                    <option value="50+">50+</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Summary */}
                            <div>
                                <div className="bg-gradient-to-br from-emerald-900 to-emerald-900/50 rounded-lg p-8 border border-emerald-700 sticky top-32">
                                    <h3 className="text-lg font-bold mb-6">Campaign Summary</h3>

                                    <div className="space-y-4 mb-6 text-sm">
                                        <div>
                                            <p className="text-zinc-300">Title</p>
                                            <p className="font-semibold text-emerald-300">{formData.title || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className="text-zinc-300">Budget</p>
                                            <p className="font-semibold text-emerald-300">${formData.budget} USD</p>
                                        </div>
                                        <div>
                                            <p className="text-zinc-300">Duration</p>
                                            <p className="font-semibold text-emerald-300">
                                                {formData.endDate && formData.startDate
                                                    ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))
                                                    : 0} days
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-zinc-300">Target</p>
                                            <p className="font-semibold text-emerald-300">{formData.targetGenre} / {formData.targetAudience}</p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !formData.title}
                                        className="w-full bg-emerald-500 text-black py-3 rounded-lg font-bold hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Creating...' : 'Create Campaign'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                {/* Manage Tab */}
                {tab === 'manage' && (
                    <div>
                        {adsLoading ? (
                            <div className="text-center py-12">
                                <p className="text-zinc-400">Loading campaigns...</p>
                            </div>
                        ) : ads.length === 0 ? (
                            <div className="bg-zinc-900 rounded-lg p-12 border border-zinc-800 text-center">
                                <p className="text-zinc-400 mb-4">No campaigns yet</p>
                                <button
                                    onClick={() => setTab('create')}
                                    className="text-emerald-400 hover:underline"
                                >
                                    Create your first campaign
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {ads.map((ad) => (
                                    <div key={ad.id} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold">{ad.title}</h3>
                                                <p className="text-zinc-400 text-sm mt-1">{ad.description}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ad.status === 'active' ? 'bg-emerald-900 text-emerald-300' :
                                                ad.status === 'paused' ? 'bg-yellow-900 text-yellow-300' :
                                                    ad.status === 'draft' ? 'bg-blue-900 text-blue-300' :
                                                        'bg-gray-900 text-gray-300'
                                                }`}>
                                                {ad.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="grid md:grid-cols-5 gap-4 mb-6 py-4 border-t border-b border-zinc-800">
                                            <div>
                                                <p className="text-zinc-400 text-xs">Budget</p>
                                                <p className="font-semibold">${ad.budget}</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-400 text-xs">Spent</p>
                                                <p className="font-semibold">${ad.spent.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-400 text-xs">Impressions</p>
                                                <p className="font-semibold">{ad.impressionCount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-400 text-xs">Clicks</p>
                                                <p className="font-semibold">{ad.clickCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-400 text-xs">CTR</p>
                                                <p className="font-semibold">
                                                    {ad.impressionCount > 0 ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2) : '0'}%
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            {ad.status === 'draft' && (
                                                <button
                                                    onClick={() => handleAdAction(ad.id, 'launch')}
                                                    className="px-4 py-2 bg-emerald-500 text-black rounded-lg font-semibold hover:bg-emerald-400 transition"
                                                >
                                                    Launch
                                                </button>
                                            )}
                                            {ad.status === 'active' && (
                                                <button
                                                    onClick={() => handleAdAction(ad.id, 'pause')}
                                                    className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
                                                >
                                                    Pause
                                                </button>
                                            )}
                                            {ad.status === 'paused' && (
                                                <button
                                                    onClick={() => handleAdAction(ad.id, 'resume')}
                                                    className="px-4 py-2 bg-emerald-500 text-black rounded-lg font-semibold hover:bg-emerald-400 transition"
                                                >
                                                    Resume
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleAdAction(ad.id, 'complete')}
                                                className="px-4 py-2 bg-zinc-700 text-white rounded-lg font-semibold hover:bg-zinc-600 transition"
                                            >
                                                End
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
