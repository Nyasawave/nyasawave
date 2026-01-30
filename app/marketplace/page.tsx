'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { ExtendedSession } from '@/app/types/auth';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    sellerId: string;
    sellerName: string;
    image?: string;
    category: string;
    sold: number;
    status: 'active' | 'sold' | 'inactive';
}

export default function Marketplace() {
    const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'beats' | 'exclusive' | 'services' | 'merchandise'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const isSeller = session?.user?.roles?.some(role => ['ADMIN', 'MARKETER', 'ENTREPRENEUR'].includes(role));

    useEffect(() => {
        fetchProducts();
    }, [filter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const query = filter !== 'all' ? `?category=${filter}` : '';
            const response = await fetch(`/api/marketplace/products${query}`);
            const data = await response.json();
            if (data.ok) {
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-black pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">NyasaWave Marketplace</h1>
                    <p className="text-xl text-zinc-400">
                        {isSeller
                            ? 'Buy and sell beats, exclusive tracks, services, and merchandise'
                            : 'Browse beats, exclusive tracks, and artist merchandise'}
                    </p>
                </div>

                {/* Action Bar */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-400"
                        />
                    </div>
                    {isSeller && (
                        <Link
                            href="/marketplace/products/new"
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                        >
                            + List Product
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="mb-8 flex gap-2 flex-wrap">
                    {(['all', 'beats', 'exclusive', 'services', 'merchandise'] as const).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === cat
                                ? 'bg-emerald-600 text-white'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Loading products...</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/marketplace/${product.id}`}
                                className="group bg-zinc-900 rounded-lg border border-zinc-800 hover:border-emerald-600 transition overflow-hidden cursor-pointer"
                            >
                                {/* Image Placeholder */}
                                <div className="w-full h-40 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center group-hover:from-emerald-900/30 group-hover:to-zinc-900 transition">
                                    {product.image ? (
                                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-zinc-600 text-4xl">🎵</div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-white group-hover:text-emerald-400 transition line-clamp-2">
                                        {product.title}
                                    </h3>
                                    <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{product.sellerName}</p>
                                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{product.description}</p>

                                    {/* Price & Stats */}
                                    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                                        <span className="text-lg font-bold text-emerald-400">
                                            {product.currency === 'MWK' ? 'MWK' : '$'} {product.price}
                                        </span>
                                        <span className="text-xs text-zinc-500">{product.sold} sold</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-zinc-400 mb-4">No products found</p>
                        {isSeller && (
                            <Link
                                href="/marketplace/products/new"
                                className="text-emerald-400 hover:text-emerald-300 font-medium"
                            >
                                Be the first to list a product
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
