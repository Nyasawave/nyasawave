'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Content {
    id: string;
    title: string;
    artist: string;
    type: 'track' | 'album' | 'playlist';
    status: 'active' | 'flagged' | 'removed';
    streams: number;
    flaggedCount: number;
    uploadedAt: string;
}

export default function AdminContentPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [content, setContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signin');
        }
        if (session && !(session.user as any).roles?.includes('ADMIN')) {
            router.push('/unauthorized');
        }
    }, [session, status, router]);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const response = await fetch('/api/admin/content');
            if (response.ok) {
                const data = await response.json();
                setContent(data.content || []);
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveContent = async (contentId: string) => {
        try {
            const response = await fetch(`/api/admin/content`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentId }),
            });
            if (response.ok) {
                fetchContent();
            }
        } catch (error) {
            console.error('Error removing content:', error);
        }
    };

    const filteredContent = content.filter(item =>
        filterStatus === 'ALL' || item.status === filterStatus
    );

    if (loading) {
        return (
            <main className="min-h-screen bg-black pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse text-zinc-400">Loading content...</div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-32 pb-16 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Content Moderation</h1>
                    <p className="text-zinc-400">Review and manage all platform content</p>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-4">
                    <label htmlFor="content-filter" className="text-zinc-400 flex items-center">
                        Filter:
                    </label>
                    <select
                        id="content-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                    >
                        <option value="ALL">All Status</option>
                        <option value="active">Active</option>
                        <option value="flagged">Flagged</option>
                        <option value="removed">Removed</option>
                    </select>
                </div>

                {/* Content Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Title</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Artist</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Streams</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Flags</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {filteredContent.map(item => (
                                    <tr key={item.id} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-white font-medium">{item.title}</td>
                                        <td className="px-6 py-4 text-sm text-zinc-400">{item.artist}</td>
                                        <td className="px-6 py-4 text-sm text-zinc-400 capitalize">{item.type}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active'
                                                ? 'bg-green-900 text-green-200'
                                                : item.status === 'flagged'
                                                    ? 'bg-yellow-900 text-yellow-200'
                                                    : 'bg-red-900 text-red-200'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-400">{item.streams.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-zinc-400">{item.flaggedCount}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {item.status !== 'removed' && (
                                                <button
                                                    onClick={() => handleRemoveContent(item.id)}
                                                    className="px-3 py-1 bg-red-900 hover:bg-red-800 text-red-200 rounded text-xs transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 text-zinc-400 text-sm">
                    Total Content: {filteredContent.length}
                </div>
            </div>
        </main>
    );
}
