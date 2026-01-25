import { Star } from "lucide-react";
import Link from "next/link";

interface UpcomingArtistCardProps {
  id: string;
  name: string;
  slug: string;
  genre: string;
  monthlyListeners: number;
}

export default function UpcomingArtistCard({
  id,
  name,
  slug,
  genre,
  monthlyListeners,
}: UpcomingArtistCardProps) {
  return (
    <Link href={`/artists/${slug}`}>
      <div className="rounded-2xl bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-amber-600/30 p-4 hover:border-amber-400 transition cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
            {name.charAt(0)}
          </div>
          <Star size={16} className="text-amber-400" fill="currentColor" />
        </div>
        <h3 className="font-semibold text-white mb-1 group-hover:text-amber-400 transition">{name}</h3>
        <p className="text-sm text-zinc-400 mb-2">{genre}</p>
        <p className="text-xs text-amber-600/70">
          {(monthlyListeners / 1000).toFixed(0)}K listeners
        </p>
      </div>
    </Link>
  );
}
