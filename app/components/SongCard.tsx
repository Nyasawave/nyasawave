'use client';

import { usePlayer, Song } from '../context/PlayerContext';

export default function SongCard({ song }: { song: Song }) {
  const { playSong } = usePlayer() as { playSong?: (s: Song) => void };

  const handleClick = () => {
    if (typeof playSong === 'function') {
      playSong(song);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-zinc-900 p-4 rounded-lg cursor-pointer hover:bg-zinc-800 transition"
    >
      {song?.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={song.cover} alt={song.title} className="rounded mb-3 w-full aspect-square object-cover bg-zinc-700" />
      )}
      <h3 className="font-semibold text-sm truncate">{song.title}</h3>
      <p className="text-xs opacity-70 truncate">{song.artist}</p>
    </div>
  );
}