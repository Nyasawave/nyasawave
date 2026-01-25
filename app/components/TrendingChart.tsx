import { TrendingUp } from "lucide-react";
import Link from "next/link";

interface TrendingChartProps {
  rank: number;
  title: string;
  artist: string;
  artistSlug: string;
  change: number; // positive or negative
}

export default function TrendingChart({
  rank,
  title,
  artist,
  artistSlug,
  change,
}: TrendingChartProps) {
  const isUp = change > 0;

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/60 transition border border-zinc-800/50">
      <div className="text-lg font-bold text-emerald-400 w-8">{rank}</div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white truncate text-sm">{title}</h4>
        <Link
          href={`/artists/${artistSlug}`}
          className="text-xs text-zinc-400 hover:text-emerald-400 transition truncate"
        >
          {artist}
        </Link>
      </div>

      <div
        className={`flex items-center gap-1 text-sm font-semibold flex-shrink-0 ${isUp ? "text-emerald-400" : "text-red-400"
          }`}
      >
        <div className={isUp ? '' : 'rotate-180'}>
          <TrendingUp size={14} />
        </div>
        {Math.abs(change)}
      </div>
    </div>
  );
}
