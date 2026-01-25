"use client";

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 animate-pulse">
      <div className="w-full h-40 bg-zinc-700 rounded mb-3"></div>
      <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
