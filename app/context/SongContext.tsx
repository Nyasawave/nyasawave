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
        const res = await fetch("/api/songs");
        if (!res.ok) throw new Error("Failed to fetch songs");
        const data = await res.json();
        setSongs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setSongs([]);
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
