"use client";

export default function NewsCard({
  item,
}: {
  item: { title: string; excerpt?: string; date?: string; link?: string };
}) {
  return (
    <article className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 card-anim fade-in hover:shadow-md">
      <h3 className="font-semibold">{item.title}</h3>
      <p className="text-sm text-zinc-400 mt-2 line-clamp-3">{item.excerpt}</p>
      <div className="mt-3 text-xs text-zinc-500">{item.date}</div>
    </article>
  );
}
