'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ExtendedSession } from "@/app/types/auth";

export default function NotificationsPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user) {
            router.push('/login');
            return;
        }

        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/notifications');
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data.notifications || []);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
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
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-white mb-8">Notifications</h1>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-zinc-900 rounded-lg p-12 text-center">
                        <p className="text-zinc-400">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification: any) => (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-lg cursor-pointer transition ${notification.read
                                    ? 'bg-zinc-900 hover:bg-zinc-800'
                                    : 'bg-green-900/20 border border-green-600/30 hover:bg-green-900/30'
                                    }`}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-white font-semibold">{notification.title}</h3>
                                        <p className="text-zinc-400 text-sm mt-1">{notification.message}</p>
                                        <p className="text-zinc-500 text-xs mt-2">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
