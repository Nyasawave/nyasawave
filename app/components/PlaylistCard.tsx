"use client";

import { Heart } from "lucide-react";

interface PlaylistCardProps {
  id: string;
  title: string;
  description: string;
  trackCount: number;
  onClick?: () => void;
}

export default function PlaylistCard({
  id,
  title,
  description,
  trackCount,
  onClick,
}: PlaylistCardProps) {
  return (
    <div
      onClick={onClick}
      className="group rounded-lg bg-zinc-900/50 border border-zinc-800 p-4 hover:bg-zinc-900 hover:border-emerald-400 transition cursor-pointer"
    >
      {/* Placeholder Image */}
      <div className="w-full aspect-square rounded-md bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 mb-4 flex items-center justify-center group-hover:scale-105 transition">
        <Heart size={32} className="text-emerald-400" />
      </div>

      <h3 className="font-semibold text-white line-clamp-2 mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 line-clamp-2 mb-2">{description}</p>
      <p className="text-xs text-zinc-500">{trackCount} songs</p>
    </div>
  );
}
