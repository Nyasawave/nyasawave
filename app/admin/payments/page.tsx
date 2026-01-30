'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ExtendedSession } from "@/app/types/auth";

export default function AdminPaymentsPage() {
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
                <h1 className="text-4xl font-bold text-white mb-8">Payments & Payouts</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Total Volume</h3>
                        <p className="text-3xl font-bold text-white">$45.2K</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Pending Payouts</h3>
                        <p className="text-3xl font-bold text-white">$8.5K</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Platform Fees</h3>
                        <p className="text-3xl font-bold text-white">$4.2K</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h3 className="text-zinc-400 text-sm font-semibold mb-2">Failed Transactions</h3>
                        <p className="text-3xl font-bold text-white">3</p>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Payment History</h2>
                    <div className="text-center py-12">
                        <p className="text-zinc-400">No transactions to display</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
