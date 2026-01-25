import Button from "./Button";

export default function ArtistBoost({ artistName, onBoost }: { artistName: string; onBoost?: () => void }) {
  return (
    <div className="rounded-2xl border border-amber-600/20 bg-gradient-to-br from-amber-900/10 to-amber-900/5 p-4">
      <h3 className="font-semibold text-white mb-2">Boost {artistName}</h3>
      <p className="text-sm text-zinc-400 mb-4">Promote this upcoming artist to more listeners with a short campaign boost.</p>
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={() => onBoost && onBoost()}>Start Boost</Button>
        <Button variant="ghost">Learn more</Button>
      </div>
    </div>
  );
}
