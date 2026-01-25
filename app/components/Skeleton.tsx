export default function Skeleton({ className = "", lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-zinc-800 rounded w-full" />
      ))}
    </div>
  );
}
