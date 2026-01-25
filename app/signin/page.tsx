"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect based on role after successful sign-in
  useEffect(() => {
    if (session?.user && !isRedirecting) {
      setIsRedirecting(true);
      console.log('[SIGNIN] Session obtained, redirecting based on role:', session.user.roles);
      // Redirect based on user role
      if (session.user.roles?.includes('ADMIN')) {
        router.push('/admin');
      } else if (session.user.roles?.includes('ARTIST')) {
        router.push('/artist/dashboard');
      } else {
        // USER role or default
        router.push('/');
      }
    }
  }, [session, router, isRedirecting]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError('Provide email and password');

    setIsSigningIn(true);
    try {
      console.log('[SIGNIN] Attempting login with:', email);
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        console.error('[SIGNIN] Login failed:', result.error);
        return setError(result.error || 'Unable to sign in');
      }

      console.log('[SIGNIN] Login successful, waiting for session...');
      // signIn with redirect: false doesn't automatically update session
      // So we need to let the redirect logic in useEffect handle it
    } catch (err) {
      console.error('[SIGNIN] Exception during sign in:', err);
      setError('An error occurred during sign in');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <form onSubmit={submit} className="w-full max-w-md bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800 p-6 rounded-2xl card-anim fade-in">
        <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
        {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
        <label htmlFor="email" className="block text-sm text-zinc-400 mb-2">Email</label>
        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 mb-3"
          placeholder="you@example.com"
        />
        <label htmlFor="signinPassword" className="block text-sm text-zinc-400 mb-2">Password</label>
        <input
          id="signinPassword"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 mb-4"
          placeholder="Password"
        />

        <button
          type="submit"
          disabled={isSigningIn || status === 'loading'}
          className="w-full btn-cta bg-emerald-400 text-black py-2 font-semibold hover:bg-emerald-300 transition"
        >
          {isSigningIn ? "Signing in..." : "Sign In"}
        </button>

        <div className="mt-4 flex flex-col gap-2 text-center text-sm">
          <a href="/forgot" className="text-emerald-400 hover:text-emerald-300 transition">
            Forgot password?
          </a>
          <div className="text-zinc-400">
            Don&apos;t have an account?
            <a href="/register" className="text-emerald-400 hover:text-emerald-300 transition ml-1">
              Sign up
            </a>
          </div>
        </div>
      </form>
    </main>
  );
}
