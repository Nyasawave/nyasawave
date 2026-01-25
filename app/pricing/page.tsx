'use client';

import Link from 'next/link';

export default function Pricing() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-zinc-300">Choose the plan that fits you</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Free Plan */}
          <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 hover:border-zinc-700 transition">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-4xl font-bold mb-6">$0</p>

            <ul className="space-y-3 mb-8 text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Stream unlimited music
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Discover artists
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-500">✗</span> <span className="text-zinc-500">Download music</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-500">✗</span> <span className="text-zinc-500">Offline listening</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-500">✗</span> <span className="text-zinc-500">Ad-free listening</span>
              </li>
            </ul>

            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-semibold transition">
              Current Plan
            </button>
          </div>

          {/* Premium Fan Plan */}
          <div className="bg-zinc-900 rounded-lg p-8 border-2 border-emerald-500 hover:border-emerald-400 transition relative overflow-hidden">
            <div className="absolute -top-3 left-4 bg-emerald-500 text-black px-3 py-1 text-sm font-bold rounded">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2 mt-4">Premium</h3>
            <p className="text-4xl font-bold mb-2">$4.99<span className="text-lg text-zinc-400">/month</span></p>
            <p className="text-sm text-zinc-400 mb-6">or $49.99/year (save 16%)</p>

            <ul className="space-y-3 mb-8 text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Stream unlimited music
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Download music
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Offline listening
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Ad-free listening
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Support artists directly
              </li>
            </ul>

            <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-lg font-bold transition">
              Upgrade Now
            </button>
          </div>

          {/* Artist Pro Plan */}
          <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 hover:border-zinc-700 transition">
            <h3 className="text-2xl font-bold mb-2">Artist Pro</h3>
            <p className="text-4xl font-bold mb-6">$9.99<span className="text-lg text-zinc-400">/month</span></p>

            <ul className="space-y-3 mb-8 text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Everything in Premium
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Upload unlimited music
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Advanced analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Promotional tools
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Monthly payouts
              </li>
            </ul>

            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-semibold transition">
              Get Started
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 mb-16">
          <h2 className="text-2xl font-bold mb-6">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4">Free</th>
                  <th className="text-center py-4 px-4">Premium</th>
                  <th className="text-center py-4 px-4">Artist Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-800">
                  <td className="py-4 px-4">Streaming</td>
                  <td className="text-center">✓</td>
                  <td className="text-center">✓</td>
                  <td className="text-center">✓</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-4 px-4">Downloads</td>
                  <td className="text-center text-zinc-500">—</td>
                  <td className="text-center">✓</td>
                  <td className="text-center">✓</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-4 px-4">Upload Music</td>
                  <td className="text-center text-zinc-500">—</td>
                  <td className="text-center text-zinc-500">—</td>
                  <td className="text-center">✓</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-4 px-4">Analytics</td>
                  <td className="text-center text-zinc-500">—</td>
                  <td className="text-center text-zinc-500">—</td>
                  <td className="text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Payouts</td>
                  <td className="text-center text-zinc-500">—</td>
                  <td className="text-center text-zinc-500">—</td>
                  <td className="text-center">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h3 className="font-bold mb-2">Can I switch plans anytime?</h3>
              <p className="text-zinc-400">Yes! You can upgrade or downgrade your plan at any time.</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-zinc-400">We accept card payments, mobile money (Malawi), and PayPal.</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h3 className="font-bold mb-2">How do artist payouts work?</h3>
              <p className="text-zinc-400">Artists earn from streams and fan support. Payouts are monthly to your account.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
