'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import type { ExtendedSession } from '@/app/types/auth';

export default function CreateTournament() {
    const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        entryFee: 0,
        prizePool: 0,
        maxParticipants: 0,
        startDate: '',
        endDate: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (status === 'unauthenticated' || !session?.user?.roles?.includes('ADMIN')) {
        return (
            <main className="min-h-screen p-6 max-w-4xl mx-auto pt-32 text-center">
                <h1 className="text-3xl font-bold">Admin Only</h1>
                <p className="text-zinc-400 mt-4">Only administrators can create tournaments.</p>
                <Link href="/" className="text-emerald-400 mt-6 inline-block hover:underline">
                    Back to Home
                </Link>
            </main>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/tournaments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/tournaments');
            } else {
                setError('Failed to create tournament');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
            <div className="max-w-2xl mx-auto px-6">
                <Link href="/tournaments" className="text-emerald-400 hover:underline mb-8 inline-block">
                    ← Back to Tournaments
                </Link>

                <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                    <h1 className="text-4xl font-bold mb-6">Create Tournament</h1>

                    {error && <div className="text-red-400 mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Tournament Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter tournament title"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the tournament"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Entry Fee (MWK)</label>
                                <input
                                    type="number"
                                    value={formData.entryFee}
                                    onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                                    placeholder="0"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Prize Pool (MWK)</label>
                                <input
                                    type="number"
                                    value={formData.prizePool}
                                    onChange={(e) => setFormData({ ...formData, prizePool: Number(e.target.value) })}
                                    placeholder="0"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    placeholder="Select start date"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    placeholder="Select end date"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Max Participants</label>
                            <input
                                type="number"
                                value={formData.maxParticipants}
                                onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                                placeholder="0"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-600 text-black py-3 rounded-lg font-semibold transition"
                        >
                            {loading ? 'Creating...' : 'Create Tournament'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
