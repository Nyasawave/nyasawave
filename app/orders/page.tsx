'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Order {
    id: string;
    total: number;
    currency: string;
    status: string;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    createdAt: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please sign in to view orders');
                return;
            }

            const response = await fetch('/api/orders', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.ok) {
                setOrders(data.orders);
            } else {
                setError(data.error || 'Failed to load orders');
            }
        } catch (err) {
            setError('Error loading orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'paid':
                return 'bg-blue-500/20 text-blue-400';
            case 'shipped':
                return 'bg-purple-500/20 text-purple-400';
            case 'delivered':
                return 'bg-emerald-500/20 text-emerald-400';
            case 'canceled':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-zinc-500/20 text-zinc-400';
        }
    };

    return (
        <div className="min-h-screen bg-black pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/me" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4">
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold text-white">My Orders</h1>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Loading orders...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-8">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Orders List */}
                {!loading && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="block bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-zinc-500 text-sm mb-1">Order ID</p>
                                        <p className="font-mono text-white">{order.id}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-zinc-500 text-sm mb-1">Items</p>
                                        <p className="text-white font-bold">{order.items.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-sm mb-1">Total</p>
                                        <p className="text-emerald-400 font-bold">
                                            {order.currency === 'MWK' ? 'MWK' : 'USD'} {order.total.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-sm mb-1">Date</p>
                                        <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && orders.length === 0 && (
                    <div className="text-center py-12 bg-zinc-900 rounded-lg">
                        <p className="text-zinc-400 mb-4">No orders yet</p>
                        <Link href="/marketplace/products" className="text-emerald-400 hover:text-emerald-300">
                            Browse marketplace
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
