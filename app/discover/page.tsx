"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useSongs } from "@/context/SongContext";
import { useArtists } from "@/context/ArtistContext";
import SongsGrid from "@/components/SongsGrid";
import TrendingChart from "@/components/TrendingChart";

type SortOption = "trending" | "newest" | "popular";

export default function Discover() {
  const { playTrack } = useAudioPlayer();
  const { songs: allSongs } = useSongs();
  const { artists: allArtists } = useArtists();

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("trending");

  const genres = useMemo(
    () =>
      Array.from(
        new Set(allSongs.map((s) => s.genre ?? '').filter(Boolean))
      ),
    [allSongs]
  );

  const filteredSongs = useMemo(() => {
    let result = [...allSongs];

    // Genre filter
    if (selectedGenre) {
      result = result.filter((s) => s.genre === selectedGenre);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          (s.title ?? '').toLowerCase().includes(query) ||
          (s.artist ?? '').toLowerCase().includes(query)
      );
    }

    // Sorting
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0));
        break;

      case "newest":
        // Sort by song title alphabetically for now (no timestamp available)
        result.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
        break;

      case "trending":
      default:
        result.sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0));
        break;
    }

    return result;
  }, [allSongs, selectedGenre, searchQuery, sortBy]);

  const trendingSongs = useMemo(
    () =>
      [...allSongs]
        .sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0))
        .slice(0, 6),
    [allSongs]
  );

  return (
    <main className="min-h-screen px-6 pt-32 pb-32 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <section>
        <h1 className="text-4xl font-bold mb-2">Discover</h1>
        <p className="text-zinc-400">
          Explore trending songs, new releases, and upcoming artists across Malawi and Africa.
        </p>
      </section>

      {/* Search & Filter */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Search & Filter</h2>

        <div className="mb-6 space-y-4">
          <div>
            <label htmlFor="search-input" className="sr-only">Search songs or artists</label>
            <input
              id="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs or artists..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white placeholder-zinc-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Genre */}
            <fieldset className="flex-1">
              <legend className="block text-xs text-zinc-400 mb-2">Genre</legend>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedGenre(null)}
                  className={`px-3 py-1 rounded text-sm ${selectedGenre === null
                    ? "bg-emerald-400 text-black"
                    : "bg-zinc-800 text-zinc-300"
                    }`}
                >
                  All
                </button>

                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1 rounded text-sm ${selectedGenre === g
                      ? "bg-emerald-400 text-black"
                      : "bg-zinc-800 text-zinc-300"
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Sort */}
            <div className="sm:w-40">
              <label className="block text-xs text-zinc-400 mb-2" htmlFor="sort-select">Sort by</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-white text-sm"
              >
                <option value="trending">Trending</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-sm text-zinc-400 mb-4">
          Found <strong>{filteredSongs.length}</strong>{" "}
          {filteredSongs.length === 1 ? "track" : "tracks"}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Songs</h3>
            <SongsGrid songs={filteredSongs} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Charts */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="font-semibold mb-3">Local Charts</h3>
              <div className="space-y-2">
                {trendingSongs.map((s, idx) => (
                  <TrendingChart
                    key={s.id}
                    rank={idx + 1}
                    title={s.title}
                    artist={s.artist}
                    artistSlug={s.artistId}
                    change={Math.round((Math.random() - 0.4) * 10)}
                  />
                ))}
              </div>
            </div>

            {/* Upcoming Artists */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="font-semibold mb-3">Upcoming Artists</h3>
              <div className="space-y-2">
                {allArtists
                  .filter((a) => a.upcoming)
                  .slice(0, 4)
                  .map((a) => (
                    <Link
                      key={a.id}
                      href={`/artists/${a.slug}`}
                      className="block text-emerald-400 hover:underline"
                    >
                      {a.name}
                    </Link>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
