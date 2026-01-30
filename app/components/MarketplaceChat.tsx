'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ExtendedSession } from '@/app/types/auth';
import Link from 'next/link';

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    read: boolean;
}

interface MessageThread {
    id: string;
    buyerId: string;
    sellerId: string;
    productId: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

export default function MarketplaceChat() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const [threads, setThreads] = useState<MessageThread[]>([]);
    const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
    const [messageContent, setMessageContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    // Load all threads for current user
    useEffect(() => {
        if (session?.user?.id) {
            loadThreads();
        }
    }, [session?.user?.id]);

    const loadThreads = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/marketplace/messages');
            if (res.ok) {
                const data = await res.json();
                setThreads(data);
                if (data.length > 0 && !selectedThread) {
                    setSelectedThread(data[0]);
                }
            }
        } catch (err) {
            setError('Failed to load messages');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!messageContent.trim() || !selectedThread) return;

        try {
            setSending(true);
            const res = await fetch('/api/marketplace/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threadId: selectedThread.id,
                    content: messageContent,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                // Update selected thread
                const updatedThreads = threads.map(t =>
                    t.id === selectedThread.id
                        ? { ...t, messages: [...(t.messages || []), data.message], updatedAt: new Date().toISOString() }
                        : t
                );
                setThreads(updatedThreads);
                setSelectedThread(updatedThreads.find(t => t.id === selectedThread.id) || null);
                setMessageContent('');
            }
        } catch (err) {
            setError('Failed to send message');
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading conversations...</div>;
    }

    return (
        <div className="flex h-screen bg-black text-white pt-20">
            {/* Threads List */}
            <div className="w-80 border-r border-zinc-800 overflow-y-auto">
                <div className="p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-bold">Conversations</h2>
                </div>
                {threads.length === 0 ? (
                    <div className="p-4 text-zinc-400">No conversations yet</div>
                ) : (
                    threads.map(thread => {
                        const otherParty = thread.buyerId === session?.user?.id ? thread.sellerId : thread.buyerId;
                        return (
                            <button
                                key={thread.id}
                                onClick={() => setSelectedThread(thread)}
                                className={`w-full text-left p-4 border-b border-zinc-800 hover:bg-zinc-900 transition ${selectedThread?.id === thread.id ? 'bg-zinc-800' : ''
                                    }`}
                            >
                                <div className="text-sm font-semibold truncate">Product #{thread.productId.substring(0, 8)}</div>
                                <div className="text-xs text-zinc-400 truncate">
                                    With: {otherParty.substring(0, 8)}...
                                </div>
                                {thread.messages && thread.messages.length > 0 && (
                                    <div className="text-xs text-zinc-500 mt-1 truncate">
                                        {thread.messages[thread.messages.length - 1].content}
                                    </div>
                                )}
                            </button>
                        );
                    })
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedThread ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-zinc-800">
                            <h3 className="font-bold">Product #{selectedThread.productId.substring(0, 8)}</h3>
                            <p className="text-sm text-zinc-400">
                                {selectedThread.buyerId === session?.user?.id ? 'Seller' : 'Buyer'}: {
                                    (selectedThread.buyerId === session?.user?.id ? selectedThread.sellerId : selectedThread.buyerId).substring(0, 12)
                                }...
                            </p>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedThread.messages?.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs px-4 py-2 rounded-lg ${msg.senderId === session?.user?.id
                                                ? 'bg-green-600 text-white'
                                                : 'bg-zinc-800 text-zinc-100'
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        <p className="text-xs mt-1 opacity-70">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-zinc-800 flex gap-2">
                            <input
                                type="text"
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-zinc-900 text-white rounded px-4 py-2 border border-zinc-700 focus:outline-none focus:border-green-500"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={sending || !messageContent.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition"
                            >
                                {sending ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-400">
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded">
                    {error}
                </div>
            )}
        </div>
    );
}
