"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import styles from "./Player.module.css";

export default function Player() {
  const { currentSong, isPlaying, togglePlay, audioRef } = usePlayer();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!audioRef?.current) return;

    const updateProgress = () => {
      if (audioRef.current) {
        setProgress(
          (audioRef.current.currentTime / audioRef.current.duration) * 100 || 0
        );
      }
    };

    audioRef.current.addEventListener("timeupdate", updateProgress);
    return () => {
      audioRef.current?.removeEventListener("timeupdate", updateProgress);
    };
  }, [audioRef]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!currentSong) return null;

  // Round progress to nearest 5 to match CSS module classes (progress0, progress5, ...)
  let progStep = Math.round(progress / 5) * 5;
  progStep = Math.min(100, Math.max(0, progStep));
  const progressClassName = `${styles.progress} ${styles[`progress${progStep}`]}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur border-t border-zinc-800 text-white p-4 shadow-2xl z-50">
      <div className="flex items-center gap-4 mb-2">
        {currentSong.cover && (
          <img
            src={currentSong.cover}
            alt={currentSong.title}
            className="w-14 h-14 rounded object-cover bg-zinc-700"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{currentSong.title}</p>
          <p className="text-sm text-zinc-400 truncate">{currentSong.artist}</p>
        </div>
        <button
          onClick={togglePlay}
          className="bg-emerald-400 text-black px-6 py-2 rounded-full font-semibold hover:bg-emerald-300 transition whitespace-nowrap"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400 w-10 text-right">
          {audioRef?.current ? formatTime(audioRef.current.currentTime) : "0:00"}
        </span>
        <div className={styles.progressBar}>
          <div className={progressClassName}></div>
        </div>
        <span className="text-xs text-zinc-400 w-10">
          {audioRef?.current ? formatTime(audioRef.current.duration) : "0:00"}
        </span>
      </div>
    </div>
  );
}