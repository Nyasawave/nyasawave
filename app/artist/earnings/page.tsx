'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useState, useEffect } from 'react';

interface Withdrawal {
  id: string;
  artistId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  processedAt?: string;
}

interface Earnings {
  totalEarned: number;
  totalPending: number;
  totalWithdrawn: number;
  bySource: {
    streams: number;
    adClicks: number;
    subscriptions: number;
    boosts: number;
  };
  recentTransactions: any[];
}

export default function ArtistEarnings() {
  const { user, token } = useAuth();
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'airtel_money' | 'tnm_mpamba'>('airtel_money');
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user && user.roles?.includes('ARTIST') && token) {
      fetchEarnings();
    }
  }, [user, token]);

  const fetchEarnings = async () => {
    try {
      // Fetch earnings
      const earningsRes = await fetch('/api/artist/earnings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (earningsRes.ok) {
        const data = await earningsRes.json();
        setEarnings(data.earnings);
        setAvailableBalance(data.availableForWithdrawal);
      }

      // Fetch withdrawals
      const withdrawRes = await fetch('/api/artist/withdraw', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (withdrawRes.ok) {
        const data = await withdrawRes.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }
    if (!phoneNumber) {
      setMessage('Please enter your phone number');
      return;
    }
    if (parseFloat(withdrawalAmount) > availableBalance) {
      setMessage('Insufficient balance');
      return;
    }

    setWithdrawing(true);
    setMessage('');

    try {
      const res = await fetch('/api/artist/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawalAmount),
          method: selectedMethod,
          phoneNumber,
          currency: 'USD',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✓ Withdrawal initiated! Funds arrive in 1-2 hours.');
        setWithdrawalAmount('');
        setPhoneNumber('');
        fetchEarnings();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data?.error || 'Withdrawal failed');
      }
    } catch (err) {
      setMessage('Withdrawal failed');
      console.error(err);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold">Your Earnings</h1>
              <p className="text-zinc-400 mt-2">Track and withdraw your revenue</p>
            </div>
            <Link
              href="/artist/dashboard"
              className="text-zinc-400 hover:text-white transition underline text-sm"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">Loading earnings...</p>
          </div>
        ) : !user || !user.roles?.includes('ARTIST') ? (
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Artist Only</h2>
            <p className="text-blue-100 mb-6">This page is for artists only.</p>
            <Link
              href="/artist/signin"
              className="inline-block bg-emerald-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-emerald-400 transition"
            >
              Sign in as an artist
            </Link>
          </div>
        ) : (
          <>
            {message && (
              <div className={`px-6 py-4 rounded-lg mb-6 ${message.includes('✓')
                ? 'bg-emerald-900 text-emerald-100'
                : 'bg-red-900 text-red-100'
                }`}>
                {message}
              </div>
            )}

            {/* Balance Overview */}
            <div className="grid md:grid-cols-4 gap-4 mb-12">
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg p-6 border border-emerald-700">
                <p className="text-emerald-300 text-xs font-semibold uppercase">Available Balance</p>
                <p className="text-3xl font-bold mt-2">${availableBalance.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700">
                <p className="text-blue-300 text-xs font-semibold uppercase">Total Earned</p>
                <p className="text-3xl font-bold mt-2">${earnings?.totalEarned.toFixed(2) || '0'}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-700">
                <p className="text-purple-300 text-xs font-semibold uppercase">This Month</p>
                <p className="text-3xl font-bold mt-2">${(earnings?.bySource.streams || 0).toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-6 border border-yellow-700">
                <p className="text-yellow-300 text-xs font-semibold uppercase">Ad Revenue</p>
                <p className="text-3xl font-bold mt-2">${(earnings?.bySource.adClicks || 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Breakdown by Source */}
            {earnings && (
              <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 mb-12">
                <h2 className="text-2xl font-bold mb-6">Revenue Breakdown</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <p className="text-zinc-400 text-sm">Streams</p>
                    <p className="text-2xl font-bold mt-2">${earnings.bySource.streams.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500 mt-1">$0.005 per stream</p>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <p className="text-zinc-400 text-sm">Ad Clicks</p>
                    <p className="text-2xl font-bold mt-2">${earnings.bySource.adClicks.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500 mt-1">$0.25 per click</p>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <p className="text-zinc-400 text-sm">Subscriptions</p>
                    <p className="text-2xl font-bold mt-2">${earnings.bySource.subscriptions.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500 mt-1">10% revenue share</p>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <p className="text-zinc-400 text-sm">Boosts</p>
                    <p className="text-2xl font-bold mt-2">${earnings.bySource.boosts.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500 mt-1">Track boost fees</p>
                  </div>
                </div>
              </div>
            )}

            {/* Withdrawal Section */}
            <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 mb-12">
              <h2 className="text-2xl font-bold mb-6">Withdraw Earnings</h2>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <label className="text-zinc-400 text-sm font-semibold block mb-3">
                  Payment Method
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'airtel_money', name: 'Airtel Money', icon: '📱' },
                    { id: 'tnm_mpamba', name: 'TNM Mpamba', icon: '📲' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id as any)}
                      className={`p-4 rounded-lg border-2 transition font-semibold ${selectedMethod === method.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                        }`}
                    >
                      <p className="text-2xl mb-2">{method.icon}</p>
                      <p>{method.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-8">
                <label htmlFor="phone" className="text-zinc-400 text-sm font-semibold block mb-3">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+265 999 999 999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Withdrawal Amount */}
              <div className="mb-8">
                <label htmlFor="withdrawal-amount" className="text-zinc-400 text-sm font-semibold block mb-3">
                  Amount to Withdraw (USD)
                </label>
                <div className="flex gap-3">
                  <input
                    id="withdrawal-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setWithdrawalAmount(availableBalance.toString())}
                    className="px-4 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-semibold transition"
                  >
                    Max
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Available: ${availableBalance.toFixed(2)}
                </p>
              </div>

              {/* Withdraw Button */}
              <button
                onClick={handleWithdrawal}
                disabled={withdrawing || !withdrawalAmount || !phoneNumber}
                className={`w-full py-3 rounded-lg font-bold text-white transition ${withdrawing || !withdrawalAmount || !phoneNumber
                  ? 'bg-zinc-700 cursor-not-allowed opacity-50'
                  : 'bg-emerald-500 hover:bg-emerald-400'
                  }`}
              >
                {withdrawing ? 'Processing...' : 'Withdraw Now'}
              </button>
            </div>

            {/* Transaction History */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h2 className="text-xl font-bold mb-6">Recent Withdrawals</h2>
              {withdrawals.length === 0 ? (
                <p className="text-zinc-400">No withdrawals yet</p>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition"
                    >
                      <div>
                        <p className="font-semibold">{tx.method}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(tx.requestedAt).toLocaleDateString()} • {tx.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${tx.amount.toFixed(2)}</p>
                        <p
                          className={`text-xs font-semibold capitalize ${tx.status === 'completed'
                            ? 'text-emerald-400'
                            : tx.status === 'failed'
                              ? 'text-red-400'
                              : 'text-yellow-400'
                            }`}
                        >
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
