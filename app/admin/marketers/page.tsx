'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ExtendedSession } from "@/app/types/auth";

export default function AdminMarketersPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();

    useEffect(() => {
        if (session && !(session.user as any)?.roles?.includes('ADMIN')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-white mb-8">Marketers</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Total Marketers</h3>
                        <p className="text-3xl font-bold text-white">89</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Active Campaigns</h3>
                        <p className="text-3xl font-bold text-white">34</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Campaign Earnings</h3>
                        <p className="text-3xl font-bold text-white">$12.5K</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Marketer Management</h2>
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Marketer list will be displayed here</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
