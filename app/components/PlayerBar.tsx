'use client';

import { usePlayer } from '../context/PlayerContext';
import { downloadSong } from '@/lib/downloadSong';

export default function PlayerBar() {
  const { currentSong, isPlaying, togglePlay, isPremium } = usePlayer();

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 p-4 flex justify-between items-center z-50 gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {currentSong.cover && (
          <img
            src={currentSong.cover}
            alt={currentSong.title}
            className="w-12 h-12 rounded object-cover bg-zinc-700"
          />
        )}
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{currentSong.title}</p>
          <p className="text-xs opacity-60 truncate">{currentSong.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPremium ? (
          <button
            onClick={() => downloadSong(currentSong)}
            className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-400 transition text-sm"
            title="Download this song"
          >
            ⬇ Download
          </button>
        ) : (
          <button
            disabled
            className="bg-gray-700 text-gray-400 px-4 py-2 rounded-full font-semibold cursor-not-allowed text-sm"
            title="Upgrade to Premium to download"
          >
            💎 Premium Only
          </button>
        )}

        <button
          onClick={togglePlay}
          className="bg-emerald-400 text-black px-6 py-2 rounded-full font-semibold hover:bg-emerald-300 transition"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>
    </div>
  );
}
