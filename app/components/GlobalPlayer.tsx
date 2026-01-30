'use client';

import { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';

interface Track {
    id: string;
    title: string;
    artist: string;
    duration: number;
    url?: string;
}

interface PlayerProps {
    track?: Track;
    onTrackChange?: (trackId: string) => void;
    autoPlay?: boolean;
}

export default function GlobalPlayer({ track, onTrackChange, autoPlay = false }: PlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isFavorited, setIsFavorited] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handlePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseInt(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol / 100;
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!track) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-4">
                <div className="text-center text-gray-400 py-4">No track selected</div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-4 z-40">
            <audio
                ref={audioRef}
                src={track.url || ''}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Progress Bar */}
            <div className="mb-3 flex items-center gap-2">
                <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={track.duration}
                    value={currentTime}
                    onChange={handleSeek}
                    title="Progress bar"
                    className="flex-1 h-1 bg-gray-800 rounded cursor-pointer accent-purple-500"
                />
                <span className="text-xs text-gray-400">{formatTime(track.duration)}</span>
            </div>

            {/* Track Info & Controls */}
            <div className="flex items-center justify-between">
                {/* Track Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-4 mx-6">
                    <button
                        onClick={() => setIsFavorited(!isFavorited)}
                        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                        className={`p-2 rounded-full transition ${isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                    </button>

                    <button className="p-2 rounded-full text-gray-400 hover:text-white transition" title="Skip to previous track">
                        <SkipBack size={20} />
                    </button>

                    <button
                        onClick={handlePlayPause}
                        title={isPlaying ? 'Pause' : 'Play'}
                        className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition"
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>

                    <button className="p-2 rounded-full text-gray-400 hover:text-white transition" title="Skip to next track">
                        <SkipForward size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                        <Volume2 size={18} className="text-gray-400" />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            title="Volume control"
                            className="w-20 h-1 bg-gray-800 rounded cursor-pointer accent-purple-500"
                        />
                    </div>
                </div>

                {/* Spacer */}
                <div className="w-32" />
            </div>
        </div>
    );
}
