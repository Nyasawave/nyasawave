"use client";

import Link from "next/link";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={(className ?? "") + " text-xl md:text-2xl font-extrabold tracking-tight logo-anim"}>
      <span className="text-white">Nyasa</span><span className="text-emerald-400">Wave</span>
    </Link>
  );
}
