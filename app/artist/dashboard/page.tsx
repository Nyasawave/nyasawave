'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ExtendedSession } from '@/app/types/auth';

export default function ArtistDashboard() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scheduling, setScheduling] = useState<Record<string, string>>({});
  const [boostHours, setBoostHours] = useState<Record<string, number>>({});
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  // Wait for session to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 500);

    if (status !== 'loading') {
      setIsAuthLoading(false);
    }

    return () => clearTimeout(timer);
  }, [status]);

  // Check if user is authenticated and is an artist
  const user = (session?.user as any);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/artist/releases?artistId=${user?.id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTracks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load tracks', err);
      setTracks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user || !user.roles?.includes('ARTIST')) return;
    fetchTracks();
  }, [user]);

  const handleLogout = () => {
    signOut();
    router.push('/artist/signin');
  };

  const scheduleRelease = async (songId: string) => {
    const scheduledAt = scheduling[songId];
    if (!scheduledAt) return alert('Choose a date and time to schedule');
    try {
      const res = await fetch('/api/artist/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule', songId, scheduledAt, artistId: user?.id }),
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
      const res = await fetch('/api/artist/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'boost', songId, hours, artistId: user?.id }),
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

  const totalPlays = tracks.reduce((s, t) => s + (t.plays || 0), 0);
  const totalLikes = tracks.reduce((s, t) => s + (t.likes || 0), 0);
  const totalTracks = tracks.length;

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
            <Link href="/artist/earnings" className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-500 transition">
              💰 View Earnings
            </Link>
            <button onClick={fetchTracks} className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-700 transition">
              Refresh
            </button>
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{track.title}</h3>
                        <p className="text-sm text-zinc-400 mt-1">{track.artist}</p>
                        <p className="text-xs text-zinc-500 mt-2">{track.genre}</p>

                        {/* Track Stats */}
                        <div className="flex gap-4 mt-3 text-xs">
                          <span className="text-zinc-400">▶ {track.plays?.toLocaleString() || 0} plays</span>
                          <span className="text-zinc-400">♥ {track.likes?.toLocaleString() || 0} likes</span>
                          {track.duration && <span className="text-zinc-400">⏱ {track.duration}</span>}
                        </div>

                        {/* Status Badges */}
                        <div className="flex gap-2 mt-2">
                          {track.isBoosted && <span className="text-xs bg-pink-900/50 text-pink-300 px-2 py-1 rounded">🚀 Boosted</span>}
                          {track.copyrightStatus === 'clear' && <span className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-1 rounded">✓ Copyright Clear</span>}
                          {track.copyrightStatus === 'warning' && <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded">⚠️ Copyright Warning</span>}
                        </div>

                        {/* Show Full Details Button */}
                        <button
                          onClick={() => setShowDetails({ ...showDetails, [track.id]: !showDetails[track.id] })}
                          className="text-xs text-emerald-400 hover:text-emerald-300 mt-2 transition"
                        >
                          {showDetails[track.id] ? '▼ Hide Details' : '▶ Show Full Details'}
                        </button>
                      </div>

                      {/* Play Button */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPlayingTrackId(playingTrackId === track.id ? null : track.id)}
                          className="bg-emerald-500 text-black px-4 py-2 rounded font-semibold hover:bg-emerald-400 transition text-sm"
                        >
                          {playingTrackId === track.id ? '⏸ Stop' : '▶ Play'}
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `/api/artist/download-track?trackId=${track.id}`;
                            link.download = `${track.title}.mp3`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-500 transition text-sm"
                        >
                          ⬇ Download
                        </button>
                      </div>
                    </div>

                    {/* Full Details Section */}
                    {showDetails[track.id] && (
                      <div className="mt-4 p-4 bg-zinc-800/50 rounded border border-zinc-700 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          {track.albumName && <div><span className="text-zinc-400">Album:</span> {track.albumName}</div>}
                          {track.composer && <div><span className="text-zinc-400">Composer:</span> {track.composer}</div>}
                          {track.producer && <div><span className="text-zinc-400">Producer:</span> {track.producer}</div>}
                          {track.releaseDate && <div><span className="text-zinc-400">Released:</span> {new Date(track.releaseDate).toLocaleDateString()}</div>}
                          {track.copyrightHolder && <div><span className="text-zinc-400">Copyright:</span> {track.copyrightHolder}</div>}
                          {track.isOriginal && <div className="text-emerald-400">✓ Original Composition</div>}
                        </div>
                        {track.description && (
                          <p className="text-zinc-400 mt-4">{track.description}</p>
                        )}
                      </div>
                    )}

                    {/* Now Playing */}
                    {playingTrackId === track.id && (
                      <div className="mt-3 p-3 bg-emerald-900/30 border border-emerald-600/30 rounded">
                        <p className="text-xs text-emerald-300">🎵 Now Playing: {track.title}</p>
                        <div className="w-full bg-zinc-700 rounded-full h-1 mt-2">
                          <div className="bg-emerald-500 h-1 rounded-full w-1/3"></div>
                        </div>
                      </div>
                    )}

                    {track.scheduledAt && (
                      <p className="text-xs text-amber-300 mt-2">📅 Scheduled: {new Date(track.scheduledAt).toLocaleString()}</p>
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
                        placeholder="Pick date and time"
                        title="Schedule when to release this track"
                        className="w-full mt-2 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => scheduleRelease(track.id)} className="flex-1 bg-emerald-500 text-black px-3 py-2 rounded font-semibold hover:bg-emerald-400 transition">
                          Schedule
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`boost-${track.id}`} className="text-zinc-400 text-xs">Boost Globally (hours)</label>
                      <div className="flex gap-2 mt-2">
                        <input
                          id={`boost-${track.id}`}
                          type="number"
                          min={1}
                          value={boostHours[track.id] || 24}
                          onChange={(e) => setBoostHours({ ...boostHours, [track.id]: Number(e.target.value) })}
                          placeholder="24"
                          title="Number of hours to boost"
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
