'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ExtendedSession } from '@/app/types/auth';

interface Tournament {
    id: string;
    name: string;
    type: 'WEEKLY' | 'MONTHLY' | 'SPONSORED';
    status: 'active' | 'pending' | 'completed';
    entryFee: number;
    prizePool: number;
    totalEntries: number;
    startsAt: string;
    endsAt: string;
}

export default function AdminTournamentsPage() {
    const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
    const router = useRouter();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'WEEKLY',
        entryFee: 0,
        prizePool: 0,
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signin');
        }
        if (session && !(session.user as any).roles?.includes('ADMIN')) {
            router.push('/unauthorized');
        }
    }, [session, status, router]);

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const response = await fetch('/api/admin/tournaments');
            if (response.ok) {
                const data = await response.json();
                setTournaments(data.tournaments || []);
            }
        } catch (error) {
            console.error('Error fetching tournaments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTournament = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/tournaments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setShowCreate(false);
                setFormData({ name: '', type: 'WEEKLY', entryFee: 0, prizePool: 0 });
                fetchTournaments();
            }
        } catch (error) {
            console.error('Error creating tournament:', error);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse text-zinc-400">Loading tournaments...</div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-32 pb-16 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Tournaments</h1>
                        <p className="text-zinc-400">Create and manage music competitions</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        {showCreate ? 'Cancel' : 'Create Tournament'}
                    </button>
                </div>

                {/* Create Form */}
                {showCreate && (
                    <form onSubmit={handleCreateTournament} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Tournament Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            />
                            <label htmlFor="tournament-type" className="text-zinc-400 text-sm">Type:</label>
                            <select
                                id="tournament-type"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            >
                                <option value="WEEKLY">Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="SPONSORED">Sponsored</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Entry Fee"
                                value={formData.entryFee}
                                onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                                required
                                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            />
                            <input
                                type="number"
                                placeholder="Prize Pool"
                                value={formData.prizePool}
                                onChange={(e) => setFormData({ ...formData, prizePool: Number(e.target.value) })}
                                required
                                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Create Tournament
                        </button>
                    </form>
                )}

                {/* Tournaments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map(tournament => (
                        <div key={tournament.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                            <div className="space-y-2 text-sm text-zinc-400 mb-4">
                                <p><span className="text-zinc-300">Type:</span> {tournament.type}</p>
                                <p><span className="text-zinc-300">Status:</span> {tournament.status}</p>
                                <p><span className="text-zinc-300">Entry Fee:</span> ${tournament.entryFee}</p>
                                <p><span className="text-zinc-300">Prize Pool:</span> ${tournament.prizePool}</p>
                                <p><span className="text-zinc-300">Entries:</span> {tournament.totalEntries}</p>
                            </div>
                            <Link
                                href={`/admin/tournaments/${tournament.id}`}
                                className="block text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>

                {tournaments.length === 0 && (
                    <div className="text-center py-12 text-zinc-400">
                        No tournaments created yet.
                    </div>
                )}
            </div>
        </main>
    );
}
