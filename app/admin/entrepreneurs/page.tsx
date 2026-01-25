'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminEntrepreneursPage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session && !session.user.roles?.includes('ADMIN')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-white mb-8">Entrepreneurs</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Total Entrepreneurs</h3>
                        <p className="text-3xl font-bold text-white">156</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Verified</h3>
                        <p className="text-3xl font-bold text-white">142</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Pending Verification</h3>
                        <p className="text-3xl font-bold text-white">14</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Entrepreneur Management</h2>
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Entrepreneur list will be displayed here</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
