'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ExtendedSession } from "@/app/types/auth";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!session?.user) {
            router.push('/signin');
            return;
        }

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/notifications');
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data.notifications || []);
                    setError(null);
                } else {
                    setError('Failed to load notifications');
                }
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
                setError('Unable to load notifications');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [session, router]);

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true }),
            });

            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
            });

            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'MUSIC': return '🎵';
            case 'PAYMENT': return '💳';
            case 'SOCIAL': return '👥';
            case 'TOURNAMENT': return '🏆';
            default: return '📢';
        }
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
                    <p className="text-zinc-400">
                        {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="text-emerald-400 ml-2">
                                ({notifications.filter(n => !n.read).length} unread)
                            </span>
                        )}
                    </p>
                </div>

                {/* Error state */}
                {error && (
                    <div className="bg-red-900/20 border border-red-600/30 text-red-300 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                        <p className="text-zinc-400 mt-4">Loading notifications...</p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && notifications.length === 0 && (
                    <div className="bg-zinc-900 rounded-lg p-12 text-center border border-zinc-800">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-zinc-300 font-medium mb-2">You're all caught up!</p>
                        <p className="text-zinc-500">No notifications at this time</p>
                    </div>
                )}

                {/* Notifications list */}
                {!loading && !error && notifications.length > 0 && (
                    <div className="space-y-3">
                        {notifications.map((notification: Notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-lg transition border ${notification.read
                                        ? 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900'
                                        : 'bg-emerald-900/20 border-emerald-600/30 hover:bg-emerald-900/30'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Icon & Content */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="text-2xl mt-1 flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-semibold">
                                                {notification.title}
                                            </h3>
                                            <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-zinc-500 text-xs mt-2">
                                                {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                                                {new Date(notification.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!notification.read && (
                                            <>
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded transition"
                                                    title="Mark as read"
                                                >
                                                    ✓
                                                </button>
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                            </>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="px-3 py-1 bg-zinc-800 hover:bg-red-600/30 text-zinc-400 hover:text-red-300 text-sm rounded transition"
                                            title="Delete notification"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
