"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { songs } from "@/data/songs";
import SongCard from "@/components/SongCard";
import Link from "next/link";
import type { ExtendedSession } from "@/app/types/auth";

export default function MePage() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const user = session?.user;

  if (!user) {
    return (
      <main className="min-h-screen p-6 pt-32 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Your profile</h1>
        <p className="text-zinc-400 mt-3">Sign in to view your dashboard and uploads.</p>
        <Link href="/signin" className="mt-6 inline-block bg-emerald-400 text-black px-4 py-2 rounded">Sign in</Link>
      </main>
    );
  }

  // Mock: uploaded tracks are songs where artist matches user's name
  const uploads = songs.filter((s) => s.artist === user.name);

  return (
    <main className="min-h-screen p-6 pt-32 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-zinc-400">{user.email}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-400">Subscription: {user.premiumListener ? 'Premium' : 'Free'}</p>
          <Link href="/subscribe" className="mt-2 inline-block text-emerald-400">Manage</Link>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Your Uploads</h2>
        {uploads.length === 0 ? (
          <div className="text-zinc-400">You haven't uploaded any tracks yet. <Link href="/upload" className="text-emerald-400">Upload now</Link></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploads.map((s) => (
              <SongCard key={s.id} song={{ id: s.id, title: s.title, artist: s.artist, src: s.src, cover: s.cover }} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Stats (mock)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-zinc-400 text-sm">Monthly listeners</p>
            <p className="text-2xl font-bold">{(Math.random() * 10000).toFixed(0)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-zinc-400 text-sm">Total plays</p>
            <p className="text-2xl font-bold">{(Math.random() * 500000).toFixed(0)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-zinc-400 text-sm">Fans</p>
            <p className="text-2xl font-bold">{(Math.random() * 20000).toFixed(0)}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
