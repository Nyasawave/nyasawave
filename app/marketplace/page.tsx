'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MOCK_AD_SLOTS, MOCK_CITY_MULTIPLIERS } from '../../lib/mockAds';

interface SelectedSlot {
    id: string;
    days: number;
    location?: string;
}

export default function Marketplace() {
    const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
    const [searchCategory, setSearchCategory] = useState<string>('');

    const calculateTotalPrice = (slot: typeof MOCK_AD_SLOTS[0], days: number, location?: string) => {
        let basePriceMWK = slot.price_per_dayMWK * days;
        let basePriceUSD = slot.price_per_dayUSD * days;

        if (location && location !== 'NATIONAL') {
            const multiplier = MOCK_CITY_MULTIPLIERS[location] || 1;
            basePriceMWK *= multiplier;
            basePriceUSD *= multiplier;
        }

        return {
            mwk: Math.round(basePriceMWK),
            usd: basePriceUSD.toFixed(2),
        };
    };

    const filteredSlots = searchCategory
        ? MOCK_AD_SLOTS.filter(slot => slot.placement.toLowerCase().includes(searchCategory.toLowerCase()))
        : MOCK_AD_SLOTS;

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold">NyasaWave Marketplace</h1>
                    <p className="text-zinc-400 mt-4 text-lg">Promote your music, reach your audience, grow your fanbase</p>
                </div>

                {/* Hero Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Active Campaigns</p>
                        <p className="text-3xl font-bold mt-2">12</p>
                        <p className="text-emerald-400 text-xs mt-2">2.3M impressions this month</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Platform Revenue</p>
                        <p className="text-3xl font-bold mt-2">MWK 2.1M</p>
                        <p className="text-emerald-400 text-xs mt-2">$1,260 USD</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Avg ROI</p>
                        <p className="text-3xl font-bold mt-2">3.2x</p>
                        <p className="text-emerald-400 text-xs mt-2">Artists earn back investments</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Artists Using Ads</p>
                        <p className="text-3xl font-bold mt-2">87</p>
                        <p className="text-emerald-400 text-xs mt-2">Growing daily</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="mb-12 flex gap-4">
                    <label htmlFor="marketplace-search" className="sr-only">Search ad placements</label>
                    <input
                        id="marketplace-search"
                        type="text"
                        placeholder="Search ad placements..."
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-400"
                    />
                    <Link href="/artist/ads" className="bg-emerald-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-emerald-400 transition">
                        Create Ad
                    </Link>
                </div>

                {/* Ad Slots */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Available Ad Slots</h2>

                    {filteredSlots.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-zinc-400">No ad slots found matching your search</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredSlots.map((slot) => {
                                const selectedDays = selectedSlot?.id === slot.id ? selectedSlot.days : slot.min_days;
                                const prices = calculateTotalPrice(slot, selectedDays);

                                return (
                                    <div key={slot.id} className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 hover:border-zinc-700 transition">
                                        <div className="grid md:grid-cols-3 gap-8">
                                            {/* Slot Info */}
                                            <div className="md:col-span-2">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold">{slot.placement}</h3>
                                                        <p className="text-zinc-400 text-sm mt-1">{slot.description}</p>
                                                        <div className="flex gap-4 mt-4 text-xs text-zinc-400">
                                                            <span>Available: {slot.available_slots} slots</span>
                                                            <span>Min: {slot.min_days} days</span>
                                                            <span>Max: {slot.max_days} days</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Preview Badge */}
                                                <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                                                    <p className="text-xs text-zinc-500 mb-2">Preview</p>
                                                    <div className="bg-zinc-700 rounded h-24 flex items-center justify-center text-zinc-400">
                                                        {slot.placement} Ad Preview
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pricing & Duration */}
                                            <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label htmlFor={`duration-${slot.id}`} className="text-zinc-400 text-sm">Duration (days)</label>
                                                        <input
                                                            id={`duration-${slot.id}`}
                                                            type="number"
                                                            min={slot.min_days}
                                                            max={slot.max_days}
                                                            defaultValue={slot.min_days}
                                                            onChange={(e) => setSelectedSlot({ id: slot.id, days: Number(e.target.value) })}
                                                            className="w-full mt-2 px-3 py-2 rounded bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:border-emerald-400"
                                                        />
                                                    </div>

                                                    <div className="pt-4 border-t border-zinc-700">
                                                        <p className="text-xs text-zinc-400">Per Day Rate</p>
                                                        <p className="text-sm font-semibold mt-1">
                                                            MWK {slot.price_per_dayMWK.toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-zinc-400">
                                                            ${slot.price_per_dayUSD}
                                                        </p>
                                                    </div>

                                                    <div className="pt-4 border-t border-zinc-700">
                                                        <p className="text-xs text-zinc-400">Total Price ({selectedDays} days)</p>
                                                        <p className="text-2xl font-bold mt-1 text-emerald-400">
                                                            MWK {prices.mwk.toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-zinc-400">
                                                            ${prices.usd} USD
                                                        </p>
                                                    </div>

                                                    <button className="w-full bg-emerald-500 text-black py-3 rounded-lg font-semibold hover:bg-emerald-400 transition mt-4">
                                                        Select & Create Ad
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="mt-16 grid md:grid-cols-2 gap-8">
                    <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                        <h3 className="text-xl font-bold mb-4">How It Works</h3>
                        <ol className="space-y-3 text-sm text-zinc-400">
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">1.</span>
                                <span>Choose an ad slot that fits your budget & goals</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">2.</span>
                                <span>Set your campaign duration (minimum 3 days)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">3.</span>
                                <span>Upload your artwork & description</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">4.</span>
                                <span>Complete payment (Airtel Money / TNM Mpamba)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">5.</span>
                                <span>Your ad goes live immediately</span>
                            </li>
                        </ol>
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                        <h3 className="text-xl font-bold mb-4">Pricing Multipliers</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Blantyre</span>
                                <span className="text-emerald-400 font-bold">1.2x</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Lilongwe</span>
                                <span className="text-emerald-400 font-bold">1.1x</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Mzuzu</span>
                                <span className="text-emerald-400 font-bold">0.9x</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Zomba</span>
                                <span className="text-emerald-400 font-bold">0.95x</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Mangochi</span>
                                <span className="text-emerald-400 font-bold">0.85x</span>
                            </div>
                            <div className="border-t border-zinc-700 pt-3 mt-3 flex justify-between">
                                <span className="text-zinc-400">National</span>
                                <span className="text-emerald-400 font-bold">1.5x</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
