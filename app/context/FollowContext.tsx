"use client";

import { createContext, useContext, useState } from "react";

interface FollowContextType {
  following: Set<string>;
  toggleFollow: (artistId: string) => void;
  isFollowing: (artistId: string) => boolean;
}

const FollowContext = createContext<FollowContextType | null>(null);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const toggleFollow = (artistId: string) => {
    const newFollowing = new Set(following);
    if (newFollowing.has(artistId)) {
      newFollowing.delete(artistId);
    } else {
      newFollowing.add(artistId);
    }
    setFollowing(newFollowing);
  };

  const isFollowing = (artistId: string) => following.has(artistId);

  return (
    <FollowContext.Provider value={{ following, toggleFollow, isFollowing }}>
      {children}
    </FollowContext.Provider>
  );
}

export const useFollow = () => {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow must be used inside FollowProvider");
  return ctx;
};
