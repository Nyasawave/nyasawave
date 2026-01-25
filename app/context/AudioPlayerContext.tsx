'use client';

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverArt?: string;
  duration?: number;
  artistId?: string;
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  seek: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  queue: Track[];
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  isPreviewMode: boolean;
  previewDurationRemaining: number;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const user = session?.user;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const currentIndexRef = useRef(0);
  const streamLoggedRef = useRef<boolean>(false);

  const isPreviewMode = !user; // guests are in preview mode
  const PREVIEW_LIMIT = 30; // seconds
  const [previewDurationRemaining, setPreviewDurationRemaining] = useState(PREVIEW_LIMIT);

  // Log stream when track plays >= 30 seconds
  useEffect(() => {
    if (!currentTrack || !isPlaying) return;

    if (progress >= 30 && !streamLoggedRef.current) {
      streamLoggedRef.current = true;

      // Log stream to backend
      const logStream = async () => {
        try {
          const token = localStorage.getItem('nyasawave_token');
          const headers: any = {
            'Content-Type': 'application/json',
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const ipAddress = await fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(data => data.ip)
            .catch(() => 'unknown');

          await fetch('/api/stream/log', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              trackId: currentTrack.id,
              duration: Math.round(progress),
              ipAddress,
            }),
          });
        } catch (error) {
          console.error('Failed to log stream:', error);
        }
      };

      logStream();
    }
  }, [progress, isPlaying, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);

    const handleEnded = () => {
      setIsPlaying(false);
      if (queue.length > currentIndexRef.current + 1) {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue]);

  // enforce preview limit for guests
  useEffect(() => {
    if (!isPreviewMode) return;
    if (progress >= PREVIEW_LIMIT && isPlaying) {
      // pause and clamp progress
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = PREVIEW_LIMIT;
      }
      setIsPlaying(false);
    }
    setPreviewDurationRemaining(Math.max(PREVIEW_LIMIT - progress, 0));
  }, [progress, isPlaying, isPreviewMode]);

  const playTrack = (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTrack(track);
    setProgress(0);
    setPreviewDurationRemaining(PREVIEW_LIMIT);
    streamLoggedRef.current = false; // reset stream log flag
    audio.src = track.url;
    audio.play().catch((err) => console.error('Failed to play audio:', err));
    setIsPlaying(true);

    if (!queue.find((t) => t.id === track.id)) {
      setQueue([track]);
      currentIndexRef.current = 0;
    }
  };

  const pauseTrack = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const resumeTrack = () => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      // prevent resuming past preview limit for guests
      if (isPreviewMode && audio.currentTime >= PREVIEW_LIMIT) return;
      audio.play().catch((err) => console.error('Failed to resume audio:', err));
      setIsPlaying(true);
    }
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      const maxTime = isPreviewMode ? Math.min(PREVIEW_LIMIT, audio.duration || PREVIEW_LIMIT) : audio.duration || 0;
      const seekTime = Math.min(time, maxTime);
      audio.currentTime = seekTime;
      setProgress(seekTime);
    }
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    const nextIndex = (currentIndexRef.current + 1) % queue.length;
    currentIndexRef.current = nextIndex;
    playTrack(queue[nextIndex]);
  };

  const previousTrack = () => {
    if (queue.length === 0) return;
    const prevIndex = (currentIndexRef.current - 1 + queue.length) % queue.length;
    currentIndexRef.current = prevIndex;
    playTrack(queue[prevIndex]);
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const clearQueue = () => {
    setQueue([]);
    currentIndexRef.current = 0;
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        playTrack,
        pauseTrack,
        resumeTrack,
        seek,
        nextTrack,
        previousTrack,
        queue,
        addToQueue,
        clearQueue,
        isPreviewMode,
        previewDurationRemaining,
      }}
    >
      {children}
      <audio ref={audioRef} />
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};
