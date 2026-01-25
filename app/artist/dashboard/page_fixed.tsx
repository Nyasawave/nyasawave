'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ArtistDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scheduling, setScheduling] = useState<Record<string, string>>({});
  const [boostHours, setBoostHours] = useState<Record<string, number>>({});

  if (!user || user.role !== 'ARTIST') {
    return (
      <main className="min-h-screen p-6 max-w-4xl mx-auto pt-32 text-center">
        <h1 className="text-3xl font-bold">Artist Only</h1>
        <p className="text-zinc-400 mt-4">This page is for artists only.</p>
        <Link href="/artist/signin" className="text-emerald-400 mt-6 inline-block hover:underline">
          Sign in as an artist
        </Link>
      </main>
    );
  }

  useEffect(() => {
    if (!user || user.role !== 'ARTIST') return;
    fetchTracks();
  }, [user]);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/artist/releases?artistId=${user.id}`);
      const data = await res.json();
      setTracks(data || []);
    } catch (err) {
      console.error('Failed to load tracks', err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    signOut();
    router.push('/artist/signin');
  };

  const totalPlays = tracks.reduce((s, t) => s + (t.plays || 0), 0);
  const totalLikes = tracks.reduce((s, t) => s + (t.likes || 0), 0);
  const totalTracks = tracks.length;

  const scheduleRelease = async (songId: string) => {
    const scheduledAt = scheduling[songId];
    if (!scheduledAt) return alert('Choose a date and time to schedule');
    try {
      const res = await fetch('/api/artist/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, scheduledAt }),
      });
      const json = await res.json();
      if (res.ok) {
        alert('Release scheduled');
        fetchTracks();
      } else {
        alert(json?.error || 'Failed to schedule');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to schedule release');
    }
  };

  const boostTrack = async (songId: string) => {
    const hours = boostHours[songId] || 24;
    try {
      const res = await fetch('/api/artist/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, hours }),
      });
      const json = await res.json();
      if (res.ok) {
        alert('Track boosted globally');
        fetchTracks();
      } else {
        alert(json?.error || 'Failed to boost');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to boost track');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold">Artist Dashboard</h1>
            <p className="text-zinc-400 mt-2">Manage your music & track your success</p>
            {user && <p className="text-sm text-zinc-500 mt-1">Welcome, {user.name}</p>}
          </div>
          <div className="flex gap-3">
            <Link href="/artist/upload" className="bg-emerald-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-emerald-300 transition">
              + Upload Track
            </Link>
            <button onClick={handleLogout} className="bg-zinc-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-600 transition">
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total Plays</p>
            <p className="text-3xl font-bold mt-2">{totalPlays.toLocaleString()}</p>
            <p className="text-emerald-400 text-xs mt-2">Tracks: {totalTracks}</p>
          </div>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total Likes</p>
            <p className="text-3xl font-bold mt-2">{totalLikes.toLocaleString()}</p>
            <p className="text-emerald-400 text-xs mt-2">Audience engagement</p>
          </div>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Boosted Tracks</p>
            <p className="text-3xl font-bold mt-2">{tracks.filter(t => t.isBoosted).length}</p>
            <p className="text-emerald-400 text-xs mt-2">Active promotions</p>
          </div>
        </div>

        {/* Uploaded Tracks with scheduling & boost controls */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Tracks</h2>
          {loading && <p className="text-sm text-zinc-400 mb-4">Loading...</p>}
          <div className="space-y-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:border-zinc-700 transition"
              >
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{track.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1">{track.genre}</p>
                    <p className="text-xs text-zinc-500 mt-2">Plays: {track.plays?.toLocaleString() || 0} • Likes: {track.likes?.toLocaleString() || 0}</p>
                    {track.scheduledAt && (
                      <p className="text-xs text-amber-300 mt-2">Scheduled: {new Date(track.scheduledAt).toLocaleString()}</p>
                    )}
                    {track.isBoosted && (
                      <p className="text-xs text-emerald-300 mt-1">Boost active until {new Date(track.boostExpiresAt).toLocaleString()}</p>
                    )}
                  </div>

                  <div className="w-80">
                    <div className="mb-3">
                      <label htmlFor={`schedule-${track.id}`} className="text-zinc-400 text-xs">Schedule Release</label>
                      <input
                        id={`schedule-${track.id}`}
                        value={scheduling[track.id] || ''}
                        onChange={(e) => setScheduling({ ...scheduling, [track.id]: e.target.value })}
                        type="datetime-local"
                        placeholder="Select date and time"
                        className="w-full mt-2 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => scheduleRelease(track.id)} className="flex-1 bg-emerald-500 text-black px-3 py-2 rounded font-semibold hover:bg-emerald-400 transition">
                          Schedule
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`boost-hours-${track.id}`} className="text-zinc-400 text-xs">Boost Globally (hours)</label>
                      <div className="flex gap-2 mt-2">
                        <input
                          id={`boost-hours-${track.id}`}
                          type="number"
                          min={1}
                          placeholder="24"
                          value={boostHours[track.id] || 24}
                          onChange={(e) => setBoostHours({ ...boostHours, [track.id]: Number(e.target.value) })}
                          className="w-24 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                        />
                        <button onClick={() => boostTrack(track.id)} className="flex-1 bg-pink-600 text-white px-3 py-2 rounded font-semibold hover:bg-pink-500 transition">
                          Boost
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!loading && tracks.length === 0 && <p className="text-zinc-500">No tracks found. Upload a track to get started.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
