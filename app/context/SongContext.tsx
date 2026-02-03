"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { songs as staticSongs } from "@/data/songs";

export type Song = (typeof staticSongs)[0];

type SongContextType = {
  songs: Song[];
  loading: boolean;
  error: string | null;
};

const SongContext = createContext<SongContextType | null>(null);

export function SongProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        console.log('[SongContext] Fetching songs from /api/songs');
        const res = await fetch("/api/songs");

        console.log('[SongContext] Response status:', res.status, res.statusText);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('[SongContext] Error response:', errorText);
          throw new Error(`Failed to fetch songs: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log('[SongContext] Raw data received:', data);
        console.log('[SongContext] Data is array?', Array.isArray(data));
        console.log('[SongContext] Fetched', data.length || 0, 'songs');

        if (Array.isArray(data) && data.length > 0) {
          console.log('[SongContext] First song:', data[0]);
        }

        setSongs(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[SongContext] Error fetching songs:', errorMsg);
        console.error('[SongContext] Stack:', err instanceof Error ? err.stack : 'No stack');
        setError(errorMsg);

        // Fallback to static data if API fails
        console.log('[SongContext] Falling back to static songs');
        setSongs(staticSongs);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  return (
    <SongContext.Provider value={{ songs, loading, error }}>
      {children}
    </SongContext.Provider>
  );
}

export const useSongs = () => {
  const ctx = useContext(SongContext);
  if (!ctx) throw new Error("useSongs must be used inside SongProvider");
  return ctx;
};
