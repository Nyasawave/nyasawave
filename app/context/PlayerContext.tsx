'use client';

import { createContext, useContext, useRef, useState, useEffect } from 'react';

export type Song = {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  streamUrl?: string;
  artistId?: string;
  src?: string;
  duration?: number;
  plays?: number;
  likes?: number;
};

const PlayerContext = createContext<any>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  const playSong = (song: Song) => {
    if (!audioRef.current) return;

    const audioUrl = ((song.streamUrl || song.src || '') as string).trim();
    if (!audioUrl) {
      console.error('No audio source available for song', song);
      return;
    }

    setCurrentSong(song);
    audioRef.current.src = audioUrl;
    const playPromise = audioRef.current.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Playback failed', err);
          setIsPlaying(false);
        });
    } else {
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error('Playback failed', err);
            setIsPlaying(false);
          });
      } else {
        setIsPlaying(true);
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (!currentSong) return;
      const idx = queue.findIndex((s) => s.id === currentSong.id);
      if (idx >= 0 && idx < queue.length - 1) {
        const next = queue[idx + 1];
        playSong(next);
      } else {
        setIsPlaying(false);
        setCurrentSong(null);
      }
    };

    const handleError = (e: any) => {
      console.error('Audio element error', e);
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioRef, currentSong, queue, playSong]);

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        currentSong,
        isPlaying,
        playSong,
        togglePlay,
        queue,
        setQueue,
        isPremium,
        setIsPremium,
      }}
    >
      {children}
      <audio ref={audioRef} />
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);