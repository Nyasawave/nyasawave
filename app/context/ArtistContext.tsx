"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { artists as staticArtists } from "@/data/artists";

export type Artist = (typeof staticArtists)[0];

type ArtistContextType = {
  artists: Artist[];
  loading: boolean;
  error: string | null;
};

const ArtistContext = createContext<ArtistContextType | null>(null);

export function ArtistProvider({ children }: { children: React.ReactNode }) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/artists");
        if (!res.ok) throw new Error("Failed to fetch artists");
        const data = await res.json();
        setArtists(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  return (
    <ArtistContext.Provider value={{ artists, loading, error }}>
      {children}
    </ArtistContext.Provider>
  );
}

export const useArtists = () => {
  const ctx = useContext(ArtistContext);
  if (!ctx) throw new Error("useArtists must be used inside ArtistProvider");
  return ctx;
};
