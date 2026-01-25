import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./GlobalAudioPlayer.module.css";

/**
 * GLOBAL AUDIO PLAYER COMPONENT
 * 
 * Spotify-level features:
 * - Current track display with cover art
 * - Play/pause, next, previous controls
 * - Volume control with mute
 * - Progress bar with seek
 * - Playback speed control (0.75x, 1x, 1.25x, 1.5x)
 * - Queue management
 * - Lyrics display (future)
 * - Desktop notifications
 */

export interface Track {
    id: string;
    title: string;
    artist: string;
    artistId: string;
    duration: number;
    cover?: string;
    url: string;
}

export interface GlobalAudioPlayerContextType {
    track: Track | null;
    isPlaying: boolean;
    queue: Track[];
    currentIndex: number;
    play: (track: Track) => void;
    playPlaylist: (tracks: Track[], startIndex?: number) => void;
    pause: () => void;
    resume: () => void;
    next: () => void;
    previous: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setPlaybackSpeed: (speed: number) => void;
}

interface PlayerState {
    currentTime: number;
    duration: number;
    volume: number;
    speed: number;
    isPlaying: boolean;
}

const GlobalAudioPlayer: React.FC<{
    onTrackChange?: (track: Track | null) => void;
}> = ({ onTrackChange }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [track, setTrack] = useState<Track | null>(null);
    const [queue, setQueue] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [state, setState] = useState<PlayerState>({
        currentTime: 0,
        duration: 0,
        volume: 1,
        speed: 1,
        isPlaying: false,
    });

    // Play a single track
    const play = useCallback((newTrack: Track) => {
        setTrack(newTrack);
        setQueue([newTrack]);
        setCurrentIndex(0);
        setIsPlaying(true);

        // Update audio src and play
        if (audioRef.current) {
            audioRef.current.src = newTrack.url;
            audioRef.current.load();
            audioRef.current.play().catch(e => {
                console.error("[PLAYER] Play error:", e);
            });
        }

        // Track play in database
        trackPlay(newTrack.id);
    }, []);

    // Play an entire playlist
    const playPlaylist = useCallback((tracks: Track[], startIndex = 0) => {
        setQueue(tracks);
        setCurrentIndex(startIndex);

        if (tracks.length > 0) {
            play(tracks[startIndex]);
        }
    }, [play]);

    // Pause
    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsPlaying(false);
    }, []);

    // Resume
    const resume = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => {
                console.error("[PLAYER] Resume error:", e);
            });
        }
        setIsPlaying(true);
    }, []);

    // Next track
    const next = useCallback(() => {
        if (queue.length === 0) return;

        const nextIndex =
            currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(nextIndex);
        play(queue[nextIndex]);
    }, [queue, currentIndex, play]);

    // Previous track
    const previous = useCallback(() => {
        if (queue.length === 0) return;

        // If more than 3 seconds played, restart current
        if (state.currentTime > 3) {
            seek(0);
        } else {
            // Otherwise go to previous
            const prevIndex =
                currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
            setCurrentIndex(prevIndex);
            play(queue[prevIndex]);
        }
    }, [queue, currentIndex, state.currentTime, play]);

    // Seek to time
    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setState(prev => ({ ...prev, currentTime: time }));
        }
    }, []);

    // Set volume (0-1)
    const setVolume = useCallback((volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        if (audioRef.current) {
            audioRef.current.volume = clampedVolume;
        }
        setState(prev => ({ ...prev, volume: clampedVolume }));
    }, []);

    // Set playback speed
    const setPlaybackSpeed = useCallback((speed: number) => {
        const validSpeeds = [0.75, 1, 1.25, 1.5];
        if (validSpeeds.includes(speed) && audioRef.current) {
            audioRef.current.playbackRate = speed;
            setState(prev => ({ ...prev, speed }));
        }
    }, []);

    // Audio event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setState(prev => ({
                ...prev,
                currentTime: audio.currentTime,
            }));
        };

        const handleLoadedMetadata = () => {
            setState(prev => ({
                ...prev,
                duration: audio.duration,
            }));
        };

        const handleEnded = () => {
            next();
        };

        const handlePlay = () => {
            setIsPlaying(true);
            setState(prev => ({ ...prev, isPlaying: true }));
        };

        const handlePause = () => {
            setIsPlaying(false);
            setState(prev => ({ ...prev, isPlaying: false }));
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
        };
    }, [next]);

    // Track play in database
    const trackPlay = async (trackId: string) => {
        try {
            await fetch("/api/tracks/play", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trackId }),
            });
        } catch (error) {
            console.error("[PLAYER] Track play error:", error);
        }
    };

    // Format time MM:SS
    const formatTime = (time: number) => {
        if (!isFinite(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Spacebar: play/pause
            if (e.code === "Space" && e.target === document.body) {
                e.preventDefault();
                if (isPlaying) {
                    pause();
                } else {
                    resume();
                }
            }

            // Arrow right: next
            if (e.code === "ArrowRight") {
                next();
            }

            // Arrow left: previous
            if (e.code === "ArrowLeft") {
                previous();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying, pause, resume, next, previous]);

    if (!track) {
        return null;
    }

    return (
        <div className={styles.player}>
            {/* Audio element */}
            <audio ref={audioRef} />

            {/* Player UI */}
            <div className={styles.playerContainer}>
                {/* Track info */}
                <div className={styles.trackInfo}>
                    {track.cover && (
                        <img
                            src={track.cover}
                            alt={track.title}
                            className={styles.cover}
                        />
                    )}
                    <div className={styles.metadata}>
                        <h4 className={styles.title}>{track.title}</h4>
                        <p className={styles.artist}>{track.artist}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className={styles.controls}>
                    {/* Previous */}
                    <button
                        className={styles.controlBtn}
                        onClick={previous}
                        title="Previous (←)"
                    >
                        ⏮
                    </button>

                    {/* Play/Pause */}
                    <button
                        className={`${styles.controlBtn} ${styles.playBtn}`}
                        onClick={isPlaying ? pause : resume}
                        title="Play/Pause (Space)"
                    >
                        {isPlaying ? "⏸" : "▶"}
                    </button>

                    {/* Next */}
                    <button
                        className={styles.controlBtn}
                        onClick={next}
                        title="Next (→)"
                    >
                        ⏭
                    </button>

                    {/* Speed control */}
                    <select
                        className={styles.speedSelect}
                        value={state.speed}
                        onChange={e =>
                            setPlaybackSpeed(parseFloat(e.target.value))
                        }
                    >
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                    </select>
                </div>

                {/* Progress bar */}
                <div className={styles.progress}>
                    <input
                        type="range"
                        min="0"
                        max={state.duration || 0}
                        value={state.currentTime}
                        onChange={e => seek(parseFloat(e.target.value))}
                        className={styles.progressBar}
                    />
                    <div className={styles.time}>
                        <span>{formatTime(state.currentTime)}</span>
                        <span>{formatTime(state.duration)}</span>
                    </div>
                </div>

                {/* Volume control */}
                <div className={styles.volume}>
                    <button
                        className={styles.volumeIcon}
                        onClick={() =>
                            setVolume(state.volume === 0 ? 1 : 0)
                        }
                    >
                        {state.volume === 0 ? "🔇" : "🔊"}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={state.volume}
                        onChange={e => setVolume(parseFloat(e.target.value))}
                        className={styles.volumeSlider}
                    />
                </div>

                {/* Queue info */}
                {queue.length > 1 && (
                    <div className={styles.queueInfo}>
                        {currentIndex + 1} of {queue.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalAudioPlayer;
