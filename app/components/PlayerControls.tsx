"use client";

import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

export default function PlayerControls() {
  const {
    isPlaying,
    setIsPlaying,
    currentSong,
    nextSong,
    previousSong,
  } = usePlayer();

  if (!currentSong) return null;

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Previous */}
      <button
        type="button"
        onClick={previousSong}
        aria-label="Previous song"
        title="Previous song"
        className="p-2 rounded-full hover:bg-zinc-800 transition text-zinc-400 hover:text-white"
      >
        <SkipBack size={20} />
      </button>

      {/* Play / Pause */}
      <button
        type="button"
        onClick={() => setIsPlaying(!isPlaying)}
        aria-label={isPlaying ? "Pause song" : "Play song"}
        title={isPlaying ? "Pause song" : "Play song"}
        className="p-3 rounded-full bg-emerald-400 text-black hover:bg-emerald-300 transition"
      >
        {isPlaying ? (
          <Pause size={24} />
        ) : (
          <Play size={24} fill="currentColor" />
        )}
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={nextSong}
        aria-label="Next song"
        title="Next song"
        className="p-2 rounded-full hover:bg-zinc-800 transition text-zinc-400 hover:text-white"
      >
        <SkipForward size={20} />
      </button>
    </div>
  );
}
