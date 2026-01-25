'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EntrepreneurPaymentsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !(session.user as any).roles?.includes('ENTREPRENEUR')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await fetch('/api/entrepreneur/payments');
                if (res.ok) {
                    const data = await res.json();
                    setPayments(data);
                }
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading payments...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Payment History</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900 rounded-lg p-6">
                    <p className="text-zinc-400 text-sm mb-2">Total Spent</p>
                    <p className="text-3xl font-bold">$0.00</p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-6">
                    <p className="text-zinc-400 text-sm mb-2">This Month</p>
                    <p className="text-3xl font-bold">$0.00</p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-6">
                    <p className="text-zinc-400 text-sm mb-2">Account Balance</p>
                    <p className="text-3xl font-bold">$0.00</p>
                </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                {payments.length > 0 ? (
                    <div className="space-y-2">
                        {payments.map((payment: any) => (
                            <div key={payment.id} className="flex justify-between items-center py-3 border-b border-zinc-800">
                                <div>
                                    <p className="font-semibold">{payment.description}</p>
                                    <p className="text-sm text-zinc-400">{payment.date}</p>
                                </div>
                                <p className="font-bold text-red-400">-${payment.amount}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-400">No transactions yet</p>
                )}
            </div>
        </div>
    );
}
