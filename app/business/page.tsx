"use client";

import { useState } from "react";
import Link from "next/link";
import { useArtists } from "@/context/ArtistContext";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

export default function BusinessPage() {
  const { artists } = useArtists();
  const [selectedArtist, setSelectedArtist] = useState<(typeof artists)[0] | null>(null);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'matchmaking' | 'dashboard' | 'campaigns'>('matchmaking');

  const verifiedArtists = artists.filter((a) => a.verified);
  const upcomingArtists = artists.filter((a) => a.upcoming);

  return (
    <main className="min-h-screen p-6 pt-32 max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-12 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('matchmaking')}
          className={`pb-4 px-4 font-semibold transition ${activeTab === 'matchmaking' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400 hover:text-white'}`}
        >
          Artist Matchmaking
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-4 px-4 font-semibold transition ${activeTab === 'dashboard' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400 hover:text-white'}`}
        >
          Business Dashboard
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-4 px-4 font-semibold transition ${activeTab === 'campaigns' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400 hover:text-white'}`}
        >
          Campaigns
        </button>
      </div>

      {/* Matchmaking Tab */}
      {activeTab === 'matchmaking' && (
        <>
          <section className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Artist Matchmaking for Business</h1>
            <p className="text-zinc-400 max-w-2xl">Find the perfect artist for your brand, event, or campaign. Connect with verified and emerging talent across Africa.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="text-2xl font-bold text-emerald-400 mb-3">1</div>
                <h3 className="font-semibold mb-2">Browse & Filter</h3>
                <p className="text-sm text-zinc-400">Search artists by genre, followers, and engagement metrics.</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="text-2xl font-bold text-emerald-400 mb-3">2</div>
                <h3 className="font-semibold mb-2">Connect Directly</h3>
                <p className="text-sm text-zinc-400">Send collaboration or sponsorship proposals directly to artists.</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="text-2xl font-bold text-emerald-400 mb-3">3</div>
                <h3 className="font-semibold mb-2">Collaborate</h3>
                <p className="text-sm text-zinc-400">Manage campaigns, track metrics, and grow together.</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Verified Artists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {verifiedArtists.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => {
                    setSelectedArtist(artist);
                    setOpen(true);
                  }}
                  className="rounded-2xl border border-emerald-600/30 bg-emerald-900/10 p-4 cursor-pointer hover:bg-emerald-900/20 transition"
                >
                  <div className="w-full h-24 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded mb-3 flex items-center justify-center text-2xl">
                    {artist.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-sm">{artist.name}</h3>
                  <p className="text-xs text-zinc-400">{artist.genre}</p>
                  <p className="text-xs text-emerald-400 mt-1">📊 {artist.monthlyListeners?.toLocaleString()} listeners</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Emerging Talent</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {upcomingArtists.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => {
                    setSelectedArtist(artist);
                    setOpen(true);
                  }}
                  className="rounded-2xl border border-amber-600/30 bg-amber-900/10 p-4 cursor-pointer hover:bg-amber-900/20 transition"
                >
                  <div className="w-full h-24 bg-gradient-to-br from-amber-600 to-amber-800 rounded mb-3 flex items-center justify-center text-2xl">
                    {artist.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-sm">{artist.name}</h3>
                  <p className="text-xs text-zinc-400">{artist.genre}</p>
                  <p className="text-xs text-amber-400 mt-1">🚀 Rising Star</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Business Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <section className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Business Dashboard</h1>
            <p className="text-zinc-400 max-w-2xl">Manage your campaigns, track artist partnerships, and access music licensing.</p>
          </section>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
              <p className="text-zinc-400 text-sm mb-2">Active Campaigns</p>
              <p className="text-3xl font-bold">3</p>
              <p className="text-xs text-emerald-400 mt-2">2 running, 1 planned</p>
            </div>
            <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
              <p className="text-zinc-400 text-sm mb-2">Total Impressions</p>
              <p className="text-3xl font-bold">245K</p>
              <p className="text-xs text-emerald-400 mt-2">+12% this month</p>
            </div>
            <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
              <p className="text-zinc-400 text-sm mb-2">Artist Partnerships</p>
              <p className="text-3xl font-bold">7</p>
              <p className="text-xs text-emerald-400 mt-2">All active</p>
            </div>
            <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
              <p className="text-zinc-400 text-sm mb-2">Engagement Rate</p>
              <p className="text-3xl font-bold">8.2%</p>
              <p className="text-xs text-emerald-400 mt-2">+2.1% from last month</p>
            </div>
          </div>

          {/* Music Licensing Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Music Licensing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
                <h3 className="font-bold text-lg mb-4">Available for Licensing</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 bg-zinc-800/50 rounded flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm">Track Title {i}</p>
                        <p className="text-xs text-zinc-400">Artist Name</p>
                      </div>
                      <button className="text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-black font-bold">
                        License
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
                <h3 className="font-bold text-lg mb-4">Your Licenses</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-900/20 rounded border border-emerald-600/30">
                    <p className="font-semibold text-sm">Commercial Use - Track A</p>
                    <p className="text-xs text-zinc-400">Valid until Jan 2025</p>
                  </div>
                  <div className="p-3 bg-emerald-900/20 rounded border border-emerald-600/30">
                    <p className="font-semibold text-sm">Ad Campaign - Track B</p>
                    <p className="text-xs text-zinc-400">Valid until Dec 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <>
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Marketing Campaigns</h1>
                <p className="text-zinc-400">Reach music-loving audiences through artist partnerships</p>
              </div>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-black px-6 py-3 rounded-lg font-bold">
                Create Campaign
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6">
            {[
              { name: 'Festival Sponsorship', status: 'Running', budget: 'MWK 500K', impressions: '125K', artists: 5 },
              { name: 'Product Launch', status: 'Planned', budget: 'MWK 250K', impressions: '0', artists: 3 },
              { name: 'Brand Partnership', status: 'Running', budget: 'MWK 350K', impressions: '98K', artists: 4 },
            ].map((campaign, idx) => (
              <div key={idx} className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{campaign.name}</h3>
                    <p className={`text-xs mt-1 ${campaign.status === 'Running' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {campaign.status}
                    </p>
                  </div>
                  <button className="text-xs text-zinc-400 hover:text-white">⋮</button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Budget</p>
                    <p className="font-semibold">{campaign.budget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Impressions</p>
                    <p className="font-semibold">{campaign.impressions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Artists</p>
                    <p className="font-semibold">{campaign.artists}</p>
                  </div>
                </div>

                <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded font-semibold transition text-sm">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={selectedArtist?.name || ""}>
        {selectedArtist && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Genre</p>
              <p className="font-semibold">{selectedArtist.genre}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-1">Monthly Listeners</p>
              <p className="font-semibold">{selectedArtist.monthlyListeners?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-1">About</p>
              <p className="text-sm text-zinc-300">{selectedArtist.bio}</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
              <Button onClick={() => alert(`Collaboration request sent to ${selectedArtist.name}!`)}>Send Proposal</Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
