'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Download } from 'lucide-react';

interface Product {
    id: string;
    artistId: string;
    name: string;
    description?: string;
    type: string;
    price: number;
    currency: string;
    imageUrl?: string;
    sold: number;
    status: string;
    createdAt: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    useEffect(() => {
        fetchProducts();
    }, [selectedType]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');
            const data = await response.json();

            if (data.ok) {
                let filtered = data.products;
                if (selectedType !== 'all') {
                    filtered = filtered.filter((p: Product) => p.type === selectedType);
                }
                setProducts(filtered);
            } else {
                setError('Failed to load products');
            }
        } catch (err) {
            setError('Error loading products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4">
                        <ArrowLeft size={20} />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-2">Marketplace</h1>
                    <p className="text-zinc-400">Beats, exclusive tracks, and artist merchandise</p>
                </div>

                {/* Filters */}
                <div className="mb-8 flex gap-2 flex-wrap">
                    {['all', 'beat', 'exclusive', 'merchandise', 'digital', 'service'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${selectedType === type
                                ? 'bg-emerald-500 text-black'
                                : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Loading products...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-8">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && products.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/marketplace/${product.id}`}
                                className="group bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition"
                            >
                                {/* Image */}
                                <div className="aspect-square bg-zinc-800 overflow-hidden">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Download size={40} className="text-zinc-700" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <div className="mb-2">
                                        <span className="inline-block px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded">
                                            {product.type}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-white mb-1 line-clamp-2">{product.name}</h3>
                                    <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{product.description}</p>

                                    {/* Footer */}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-emerald-400 font-bold">
                                                {product.currency === 'MWK' ? 'MWK' : 'USD'} {product.price.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-zinc-500">{product.sold} sold</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                            }}
                                            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition"
                                            aria-label="Add to cart"
                                            title="Add to cart"
                                        >
                                            <ShoppingCart size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-zinc-400 mb-4">No products found</p>
                        <Link href="/discover" className="text-emerald-400 hover:text-emerald-300">
                            Browse music instead
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
