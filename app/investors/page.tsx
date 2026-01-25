'use client';

import { useState } from 'react';
import styles from './investors.module.css';
import {
    mockInvestorMetrics,
    revenueStreams,
    marketOppportunity,
    useCase,
    fundingUse,
    teamMembers,
    expandedRoadmap,
} from '../../lib/mockInvestor';

export default function InvestorPitch() {
    const [activeSection, setActiveSection] = useState<string>('overview');

    const scrollToSection = (section: string) => {
        setActiveSection(section);
        const element = document.getElementById(section);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
            {/* Navigation Sidebar (Fixed) */}
            <div className="fixed left-0 top-0 w-64 h-screen bg-black/80 border-r border-zinc-800 pt-32 px-6 space-y-4 overflow-y-auto hidden lg:block">
                <h3 className="font-bold text-sm text-zinc-400 uppercase">Pitch Deck</h3>
                <button
                    onClick={() => scrollToSection('overview')}
                    className={`w-full text-left px-4 py-2 rounded text-sm transition ${activeSection === 'overview'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => scrollToSection('metrics')}
                    className={`w-full text-left px-4 py-2 rounded text-sm transition ${activeSection === 'metrics'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    Key Metrics
                </button>
                <button
                    onClick={() => scrollToSection('market')}
                    className={`w-full text-left px-4 py-2 rounded text-sm transition ${activeSection === 'market'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    Market Opportunity
                </button>
                <button
                    onClick={() => scrollToSection('problem')}
                    className={`w-full text-left px-4 py-2 rounded text-sm transition ${activeSection === 'problem'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    Problem & Solution
                </button>
                <button
                    onClick={() => scrollToSection('revenue')}
                    className={`w-full text-left px-4 py-2 rounded text-sm transition ${activeSection === 'revenue'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    Revenue Model
                </button>
                <button
                    onClick={() => scrollToSection('funding')}
                    className={`w-full text-left px-4 py-2 rounded text-sm transition ${activeSection === 'funding'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    Use of Funds
                </button>
                <button
                    onClick={() => scrollToSection('team')}
                    className={`w-full text-left px-4 py-2 rounded text-sm transition ${activeSection === 'team'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    Team & Hiring
                </button>
                <button
                    onClick={() => scrollToSection('roadmap')}
                    className={`w-full text-left px-4 py-2 rounded text-sm transition ${activeSection === 'roadmap'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    Roadmap
                </button>
                <button
                    onClick={() => scrollToSection('contact')}
                    className={`w-full text-left px-4 py-2 rounded text-sm transition ${activeSection === 'contact'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    Get in Touch
                </button>
            </div>

            {/* Main Content */}
            <div className="lg:ml-64 pt-32 pb-20">
                {/* Overview */}
                <section id="overview" className="px-6 py-20 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-6xl font-bold mb-6">NyasaWave</h1>
                            <p className="text-xl text-zinc-300 mb-4">
                                The Artist-First Music Platform Designed for Africa
                            </p>
                            <p className="text-lg text-zinc-400 mb-8">
                                First streaming + monetization platform built specifically for Malawian and African artists. 2,847 artists onboarded. 8.9M+ streams. MWK 4.2M revenue. Zero institutional funding.
                            </p>
                            <div className="flex gap-4">
                                <button className="bg-emerald-500 text-black px-8 py-3 rounded-lg font-bold hover:bg-emerald-400 transition">
                                    Schedule Pitch
                                </button>
                                <button className="border border-emerald-500 text-emerald-400 px-8 py-3 rounded-lg font-bold hover:bg-emerald-500/10 transition">
                                    Download Deck
                                </button>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/30 rounded-lg p-12 text-center">
                            <p className="text-3xl font-bold mb-2">$500K Seeking</p>
                            <p className="text-zinc-400">For Product, Go-to-Market, and Regional Expansion</p>
                            <div className="mt-8 space-y-4 text-left text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Current Monthly Growth</span>
                                    <span className="text-emerald-400 font-bold">23%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Monthly Active Users</span>
                                    <span className="text-emerald-400 font-bold">28,450</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Artist Retention</span>
                                    <span className="text-emerald-400 font-bold">68%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Metrics */}
                <section id="metrics" className="px-6 py-20 max-w-6xl mx-auto border-t border-zinc-800">
                    <h2 className="text-4xl font-bold mb-12">Key Metrics (Live Platform Data)</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                            <p className="text-zinc-400 text-sm">Total Users</p>
                            <p className="text-4xl font-bold mt-2">{mockInvestorMetrics.totalUsers.toLocaleString()}</p>
                            <p className="text-emerald-400 text-xs mt-2">+12% MoM</p>
                        </div>
                        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                            <p className="text-zinc-400 text-sm">Active Artists</p>
                            <p className="text-4xl font-bold mt-2">{mockInvestorMetrics.activeArtists.toLocaleString()}</p>
                            <p className="text-emerald-400 text-xs mt-2">+18% MoM</p>
                        </div>
                        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                            <p className="text-zinc-400 text-sm">Total Streams</p>
                            <p className="text-4xl font-bold mt-2">{(mockInvestorMetrics.totalStreams / 1000000).toFixed(1)}M</p>
                            <p className="text-emerald-400 text-xs mt-2">+34% MoM</p>
                        </div>
                        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                            <p className="text-zinc-400 text-sm">Monthly Revenue</p>
                            <p className="text-4xl font-bold mt-2">MWK {(mockInvestorMetrics.platformRevenueMWK / 1000000).toFixed(1)}M</p>
                            <p className="text-emerald-400 text-xs mt-2">${mockInvestorMetrics.platformRevenueUSD.toLocaleString()}</p>
                        </div>
                    </div>
                </section>

                {/* Market Opportunity */}
                <section id="market" className="px-6 py-20 max-w-6xl mx-auto border-t border-zinc-800">
                    <h2 className="text-4xl font-bold mb-12">Market Opportunity</h2>
                    <div className="bg-zinc-900 rounded-lg p-12 border border-zinc-800 mb-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-emerald-400 text-sm font-semibold uppercase mb-2">Market Size</p>
                                <p className="text-3xl font-bold mb-4">350M Internet Users in Africa</p>
                                <p className="text-zinc-400">
                                    18% streaming penetration = 63M addressable market for music streaming.
                                </p>
                            </div>
                            <div>
                                <p className="text-emerald-400 text-sm font-semibold uppercase mb-2">Revenue Potential</p>
                                <p className="text-3xl font-bold mb-4">$220M+ annually</p>
                                <p className="text-zinc-400">
                                    At $3.50 ARPU (higher than industry avg $2.50), NyasaWave's addressable market opportunity.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                            <p className="text-zinc-400 text-xs uppercase">African Population</p>
                            <p className="text-2xl font-bold mt-2">1.4B</p>
                        </div>
                        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                            <p className="text-zinc-400 text-xs uppercase">Internet Users</p>
                            <p className="text-2xl font-bold mt-2">350M</p>
                        </div>
                        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                            <p className="text-zinc-400 text-xs uppercase">Streaming Users</p>
                            <p className="text-2xl font-bold mt-2">63M</p>
                        </div>
                        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                            <p className="text-zinc-400 text-xs uppercase">TAM (at $3.50 ARPU)</p>
                            <p className="text-2xl font-bold mt-2">$220M</p>
                        </div>
                    </div>
                </section>

                {/* Problem & Solution */}
                <section id="problem" className="px-6 py-20 max-w-6xl mx-auto border-t border-zinc-800">
                    <h2 className="text-4xl font-bold mb-12">The Problem</h2>
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 mb-12">
                        <p className="text-lg leading-relaxed">
                            <strong>African artists are ignored by global platforms.</strong> Spotify pays $0.003-0.005 per stream. Artists earn nothing until 1,000 streams. There's no local infrastructure. No one builds for Malawi. Marketers can't reach engaged African audiences. Communities can't discover local music.
                        </p>
                    </div>

                    <h2 className="text-4xl font-bold mb-12">Our Solution</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-8">
                            <h3 className="font-bold text-lg mb-3">Artist-First Design</h3>
                            <p className="text-zinc-300 text-sm">
                                Artists keep 80% of boost & ad revenue (vs industry 50%). Transparent analytics. Fair play. No gatekeeping.
                            </p>
                        </div>
                        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-8">
                            <h3 className="font-bold text-lg mb-3">Location-Based Discovery</h3>
                            <p className="text-zinc-300 text-sm">
                                Discover music by district. Blantyre artists reach Lilongwe. Malawian artists go global. Built for Africa.
                            </p>
                        </div>
                        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-8">
                            <h3 className="font-bold text-lg mb-3">Two-Tier Pricing</h3>
                            <p className="text-zinc-300 text-sm">
                                MWK + USD. Welcomes artists with zero international payment access. Removes barriers.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                        <h3 className="font-bold text-lg mb-4">Traction</h3>
                        <ul className="space-y-3 text-zinc-300">
                            {useCase.traction.map((point, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="text-emerald-400">✓</span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Revenue Model */}
                <section id="revenue" className="px-6 py-20 max-w-6xl mx-auto border-t border-zinc-800">
                    <h2 className="text-4xl font-bold mb-12">Revenue Model</h2>
                    <div className="space-y-6">
                        {revenueStreams.map((stream, i) => (
                            <div key={i} className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{stream.name}</h3>
                                        <p className="text-zinc-400 text-sm mt-2">
                                            {stream.percentage}% of platform revenue
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-emerald-400">
                                            MWK {stream.revenueMWK.toLocaleString()}
                                        </p>
                                        <p className="text-zinc-400 text-sm">
                                            ${stream.revenueUSD.toLocaleString()}
                                        </p>
                                        <p className="text-emerald-400 text-sm font-semibold mt-2">
                                            +{stream.growthRate}% MoM
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full bg-zinc-800 rounded h-2">
                                    <div
                                        className={styles.progressBarFill}
                                        data-width={stream.percentage}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Use of Funds */}
                <section id="funding" className="px-6 py-20 max-w-6xl mx-auto border-t border-zinc-800">
                    <h2 className="text-4xl font-bold mb-12">Use of $500K Funding</h2>
                    <div className="space-y-6">
                        {fundingUse.map((item, i) => (
                            <div key={i} className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{item.category}</h3>
                                        <p className="text-zinc-400 text-sm mt-2">{item.description}</p>
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-400">{item.percentage}%</p>
                                </div>
                                <div className="w-full bg-zinc-800 rounded h-2">
                                    <div
                                        className={styles.progressBarFill}
                                        data-width={item.percentage}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Team */}
                <section id="team" className="px-6 py-20 max-w-6xl mx-auto border-t border-zinc-800">
                    <h2 className="text-4xl font-bold mb-12">Team & Hiring</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {teamMembers.map((member, i) => (
                            <div key={i} className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                                <h3 className="font-bold text-lg mb-2">{member.name}</h3>
                                <p className="text-emerald-400 text-sm font-semibold mb-4">{member.title}</p>
                                <p className="text-zinc-400 text-sm">{member.background}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Roadmap */}
                <section id="roadmap" className="px-6 py-20 max-w-6xl mx-auto border-t border-zinc-800">
                    <h2 className="text-4xl font-bold mb-12">Roadmap to Scale</h2>
                    <div className="space-y-6">
                        {expandedRoadmap.map((phase, i) => (
                            <div key={i} className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{phase.phase}</h3>
                                        <p className="text-emerald-400 text-sm mt-2">{phase.timeline}</p>
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    {phase.milestones.map((milestone, j) => (
                                        <li key={j} className="flex gap-3 text-sm text-zinc-300">
                                            <span className="text-emerald-400">→</span>
                                            {milestone}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact CTA */}
                <section id="contact" className="px-6 py-20 max-w-6xl mx-auto border-t border-zinc-800">
                    <div className="bg-gradient-to-r from-emerald-900/20 to-black border border-emerald-500/30 rounded-lg p-16 text-center">
                        <h2 className="text-4xl font-bold mb-4">Ready to Invest in African Music?</h2>
                        <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                            NyasaWave is the first artist-first platform changing how Africa discovers, streams, and monetizes music.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button className="bg-emerald-500 text-black px-8 py-4 rounded-lg font-bold hover:bg-emerald-400 transition text-lg">
                                Schedule Pitch Call
                            </button>
                            <button className="border border-emerald-500 text-emerald-400 px-8 py-4 rounded-lg font-bold hover:bg-emerald-500/10 transition text-lg">
                                Email: hello@nyasawave.com
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
