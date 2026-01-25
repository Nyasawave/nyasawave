'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MarketplaceProductPage() {
    const params = useParams();
    const id = params.id as string;
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/marketplace/products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data.product);
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-black pt-20 flex items-center justify-center">
                <p className="text-zinc-400">Loading product...</p>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen bg-black pt-20 flex items-center justify-center">
                <p className="text-zinc-400">Product not found</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="bg-zinc-900 rounded-lg p-8 flex items-center justify-center">
                        <p className="text-zinc-400">Product image</p>
                    </div>

                    {/* Product Details */}
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4">{product.title}</h1>
                        <p className="text-zinc-400 mb-6">{product.description}</p>

                        <div className="mb-8">
                            <p className="text-3xl font-bold text-white">${product.price}</p>
                        </div>

                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition mb-4">
                            Add to Cart
                        </button>

                        <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition">
                            Add to Wishlist
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
