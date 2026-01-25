'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';

interface ConfirmDialog {
    open: boolean;
    artistId: string;
    artistName: string;
    action: 'approve' | 'reject' | null;
}

export default function ArtistsManagement() {
    const { data: session } = useSession();
    const user = session?.user;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination] = useState<{ total: number; pages: number; limit: number } | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
        open: false,
        artistId: '',
        artistName: '',
        action: null,
    });
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Fetch artists on mount or when filter changes
    useEffect(() => {
        setCurrentPage(1); // Reset to first page on filter change
    }, [filterStatus]);

    const fetchArtistsCallback = useCallback(async () => {
        try {
            const status = filterStatus === 'all' ? 'all' : filterStatus;
            const res = await fetch(`/api/admin/artists?status=${status}&page=${currentPage}&limit=10`);
            const result = await res.json();
            if (result.success) {
                console.log('Artists fetched:', result.data);
            }
        } catch (error) {
            console.error('Failed to fetch artists:', error);
        }
    }, [filterStatus, currentPage]);

    useEffect(() => {
        fetchArtistsCallback();
    }, [fetchArtistsCallback]);

    // Auto-dismiss notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if (!user || !user.roles?.includes('ADMIN')) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-zinc-400">Access denied</p>
            </div>
        );
    }



    const showConfirmDialog = (artistId: string, artistName: string, action: 'approve' | 'reject') => {
        setConfirmDialog({
            open: true,
            artistId,
            artistName,
            action,
        });
    };

    const handleVerifyArtist = async (artistId: string, action: 'approve' | 'reject') => {
        try {
            setActionLoading(artistId);
            const res = await fetch('/api/admin/artists/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ artistId, action }),
            });
            const result = await res.json();
            if (result.success) {
                setNotification({
                    type: 'success',
                    message: `Artist ${action}ed successfully`,
                });
                fetchArtistsCallback();
                setConfirmDialog({ ...confirmDialog, open: false });
            } else {
                setNotification({ type: 'error', message: result.error || 'Action failed' });
            }
        } catch (error) {
            console.error('Failed to process request:', error);
            setNotification({ type: 'error', message: 'Failed to process request' });
        } finally {
            setActionLoading(null);
        }
    };

    const confirmAction = async () => {
        if (!confirmDialog.action) return;
        await handleVerifyArtist(confirmDialog.artistId, confirmDialog.action);
    };

    const mockArtists = [
        {
            id: 1,
            name: 'Tinowofa Records',
            email: 'contact@tinowofa.mw',
            tracks: 12,
            earnings: 15450,
            status: 'verified',
            joinDate: '2024-11-15',
            totalStreams: 28940,
        },
        {
            id: 2,
            name: 'Sister Anne Music',
            email: 'sisteranne@music.mw',
            tracks: 8,
            earnings: 8900,
            status: 'verified',
            joinDate: '2024-12-01',
            totalStreams: 15600,
        },
        {
            id: 3,
            name: 'Malawi Beats Collective',
            email: 'collective@mwbeats.mw',
            tracks: 5,
            earnings: 3200,
            status: 'pending',
            joinDate: '2024-12-18',
            totalStreams: 5800,
        },
    ];

    const filteredArtists = mockArtists.filter((artist) => {
        const matchesSearch =
            artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            artist.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || artist.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link href="/admin" className="text-zinc-400 hover:text-white mb-4 inline-block">
                            ← Admin Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold">Artists Management</h1>
                        <p className="text-zinc-400 mt-2">Verify identities, manage accounts, handle disputes</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="artist-search" className="sr-only">Search artists</label>
                            <input
                                id="artist-search"
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'verified', 'pending'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${filterStatus === status
                                        ? 'bg-emerald-500 text-black'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Artists Table */}
                <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-800/50">
                                    <th className="px-6 py-4 text-left font-semibold">Artist</th>
                                    <th className="px-6 py-4 text-left font-semibold">Tracks</th>
                                    <th className="px-6 py-4 text-left font-semibold">Earnings (MWK)</th>
                                    <th className="px-6 py-4 text-left font-semibold">Streams</th>
                                    <th className="px-6 py-4 text-left font-semibold">Joined</th>
                                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArtists.map((artist) => (
                                    <tr key={artist.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold">{artist.name}</p>
                                                <p className="text-xs text-zinc-500">{artist.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{artist.tracks}</td>
                                        <td className="px-6 py-4">{artist.earnings.toLocaleString()}</td>
                                        <td className="px-6 py-4">{artist.totalStreams.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-xs text-zinc-500">
                                            {new Date(artist.joinDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`text-xs font-bold px-2 py-1 rounded ${artist.status === 'verified'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : artist.status === 'pending'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                    }`}
                                            >
                                                {artist.status.charAt(0).toUpperCase() + artist.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {artist.status === 'pending' ? (
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => showConfirmDialog(String(artist.id), artist.name, 'approve')}
                                                        disabled={actionLoading === String(artist.id)}
                                                        className="text-xs px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 transition disabled:opacity-50"
                                                    >
                                                        {actionLoading === String(artist.id) ? 'Loading...' : 'Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => showConfirmDialog(String(artist.id), artist.name, 'reject')}
                                                        disabled={actionLoading === String(artist.id)}
                                                        className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 transition disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="text-emerald-400 hover:underline text-xs font-semibold">
                                                    View Details
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-sm text-zinc-400">
                            Page {currentPage} of {pagination.pages} ({pagination.total} total)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm font-semibold"
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                                disabled={currentPage === pagination.pages}
                                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm font-semibold"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Card */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Total Artists</p>
                        <p className="text-4xl font-bold mt-2">{mockArtists.length}</p>
                        <p className="text-xs text-emerald-400 mt-2">Verified: {mockArtists.filter((a) => a.status === 'verified').length}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Total Earnings</p>
                        <p className="text-4xl font-bold mt-2">
                            MWK {mockArtists.reduce((sum, a) => sum + a.earnings, 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Platform Revenue (2% fee)</p>
                        <p className="text-4xl font-bold mt-2 text-pink-400">
                            MWK {Math.round(mockArtists.reduce((sum, a) => sum + a.earnings, 0) * 0.02).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog & Notification */}
            {confirmDialog.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                    <div className="bg-zinc-900 rounded-lg p-6 w-[420px] border border-zinc-800">
                        <h3 className="text-lg font-bold mb-2">Confirm Action</h3>
                        <p className="text-zinc-400 mb-4">
                            {confirmDialog.action === 'approve'
                                ? `Are you sure you want to approve <strong>${confirmDialog.artistName}</strong>?`
                                : `Are you sure you want to reject <strong>${confirmDialog.artistName}</strong>?`}
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`px-3 py-2 rounded text-white ${confirmDialog.action === 'approve'
                                    ? 'bg-emerald-600 hover:bg-emerald-500'
                                    : 'bg-red-600 hover:bg-red-500'
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notification && (
                <div
                    className={`fixed bottom-6 right-6 p-4 rounded shadow-lg ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
                        } text-white`}
                >
                    {notification.message}
                </div>
            )}
        </main>
    );
}
