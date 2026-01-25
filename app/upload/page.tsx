"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Upload() {
  const { data: session } = useSession();
  const user = session?.user;
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  if (!user || !user.roles?.includes("ARTIST")) {
    return (
      <main className="p-6 space-y-4 max-w-7xl mx-auto pt-32 text-center">
        <h1 className="text-3xl font-bold mt-6">Upload Music</h1>
        <p className="text-zinc-400 mt-4">
          Only verified artists can upload tracks. Please sign in with an artist account.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a href="/artist/signin" className="bg-emerald-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-emerald-300 transition">
            Artist Sign In
          </a>
          <a href="/artist/register" className="border border-emerald-600 text-emerald-400 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-900/20 transition">
            Register as Artist
          </a>
        </div>
      </main>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(`Mock uploaded: ${title}`);
    setTitle("");
  };

  return (
    <main className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mt-6">Upload Music</h1>
      <p className="text-zinc-400">
        Share your music with the NyasaWave community.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl"
      >
        {/* Track title */}
        <div className="mb-4">
          <label
            htmlFor="trackTitle"
            className="block text-sm text-zinc-400 mb-2"
          >
            Track title
          </label>
          <input
            id="trackTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter track title"
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        {/* Audio file */}
        <div className="mb-4">
          <label
            htmlFor="audioFile"
            className="block text-sm text-zinc-400 mb-2"
          >
            Audio file (mock)
          </label>
          <input
            id="audioFile"
            type="file"
            aria-label="Upload audio file"
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-emerald-400 text-black px-4 py-2 rounded"
        >
          Upload (mock)
        </button>

        {message && (
          <div className="text-sm text-emerald-300 mt-3">{message}</div>
        )}
      </form>
    </main>
  );
}
