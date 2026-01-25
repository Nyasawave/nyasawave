'use client';

import React from 'react';
import Image from 'next/image';
import { useAudioPlayer } from '@/context/AudioPlayerContext';

/* =========================
   Utility
========================= */
const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/* =========================
   Component
========================= */
export default function AudioPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    pauseTrack,
    resumeTrack,
    seek,
    nextTrack,
    previousTrack,
  } = useAudioPlayer();

  const { isPreviewMode, previewDurationRemaining } = useAudioPlayer();

  if (!currentTrack) return null;

  const safeProgress = Math.max(progress ?? 0, 0);
  const safeDuration = Math.max(duration ?? 0, 0);
  const maxRange = isPreviewMode ? Math.max(safeProgress + previewDurationRemaining, 0) : safeDuration;

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-zinc-950 to-zinc-900 border-t border-zinc-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{currentTrack.title}</h3>
          <p className="text-xs text-zinc-400 truncate">
            {currentTrack.artist}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={previousTrack}
            aria-label="Previous track"
            title="Previous track"
            className="p-2 rounded-full hover:bg-zinc-800 transition"
          >
            ⏮
          </button>

          <button
            onClick={isPlaying ? pauseTrack : resumeTrack}
            aria-label={isPlaying ? 'Pause track' : 'Play track'}
            title={isPlaying ? 'Pause' : 'Play'}
            className="bg-emerald-500 text-black p-3 rounded-full hover:bg-emerald-400 transition font-bold text-lg"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            onClick={nextTrack}
            aria-label="Next track"
            title="Next track"
            className="p-2 rounded-full hover:bg-zinc-800 transition"
          >
            ⏭
          </button>
        </div>

        {/* Progress */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-xs text-zinc-400">
            {formatTime(safeProgress)}
          </span>

          <label htmlFor="audio-progress" className="sr-only">
            Audio playback progress
          </label>

          <input
            id="audio-progress"
            type="range"
            min={0}
            max={maxRange}
            value={Math.min(safeProgress, maxRange)}
            onChange={handleProgressChange}
            aria-label="Audio playback progress"
            title="Seek audio position"
            className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <span className="text-xs text-zinc-400">
            {isPreviewMode ? `Preview: ${formatTime(previewDurationRemaining)}` : formatTime(safeDuration)}
          </span>
        </div>

        {/* Cover Art */}
        {currentTrack.coverArt && (
          <div className="w-12 h-12 relative rounded overflow-hidden bg-zinc-800">
            <Image
              src={currentTrack.coverArt}
              alt={currentTrack.title}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
