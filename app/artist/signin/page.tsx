"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import type { ExtendedSession } from "@/app/types/auth";

export default function ArtistSignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated as artist
  useEffect(() => {
    if (session?.user?.roles?.includes('ARTIST')) {
      router.push('/artist/dashboard');
    }
  }, [session, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!emailOrUsername || !password) return setError('Provide username/email and password');

    setLoading(true);
    try {
      // For NextAuth credentials, we use email for authentication
      const isEmail = emailOrUsername.includes('@');
      const email = isEmail ? emailOrUsername : emailOrUsername; // Can adjust if needed

      console.log('[ARTIST-SIGNIN] Attempting sign in with:', email);
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        console.error('[ARTIST-SIGNIN] Sign in failed:', result.error);
        setError(result.error || 'Sign in failed');
        setLoading(false);
        return;
      }

      console.log('[ARTIST-SIGNIN] Sign in successful');
      // Let the session update trigger the redirect in useEffect above
    } catch (e) {
      console.error('[ARTIST-SIGNIN] Exception:', e);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <form onSubmit={submit} className="w-full max-w-md bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800 p-6 rounded-2xl card-anim fade-in">
        <h1 className="text-2xl font-semibold mb-4">Artist Sign In</h1>
        {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
        <label htmlFor="emailOrUsername" className="block text-sm text-zinc-400 mb-2">Username or Email</label>
        <input
          id="emailOrUsername"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 mb-3"
          placeholder="username or your@email.com"
        />
        <label htmlFor="password" className="block text-sm text-zinc-400 mb-2">Password</label>
        <input
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 mb-4"
          placeholder="Password"
        />

        <button type="submit" disabled={loading} className="w-full btn-cta bg-emerald-400 text-black py-2 font-semibold hover:bg-emerald-300 transition">
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-zinc-400">Don't have an account? <Link href="/artist/register" className="text-emerald-400 hover:underline">Register</Link></p>
        </div>
      </form>
    </main>
  );
}
