"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ArtistRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [stageName, setStageName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName || !stageName || !username || !email || !phone || !password || !passwordConfirm) {
      return setError('Please fill all fields');
    }
    if (password !== passwordConfirm) return setError('Passwords do not match');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-artist', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fullName, stageName, username, email, phone, password, passwordConfirm }) });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Unable to register');
        setLoading(false);
        return;
      }
      router.push('/artist/signin');
    } catch (e) {
      setError('Network error');
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <form onSubmit={submit} className="w-full max-w-lg bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800 p-6 rounded-2xl card-anim fade-in">
        <h1 className="text-2xl font-semibold mb-4">Artist Registration</h1>
        {error && <div className="text-sm text-red-400 mb-3">{error}</div>}

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="fullName" className="block text-sm text-zinc-400 mb-1">Full Name</label>
            <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full legal name" className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700" />
          </div>
          <div>
            <label htmlFor="stageName" className="block text-sm text-zinc-400 mb-1">Stage Name</label>
            <input id="stageName" value={stageName} onChange={(e) => setStageName(e.target.value)} placeholder="Stage name" className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700" />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm text-zinc-400 mb-1">Username</label>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-zinc-400 mb-1">Email</label>
            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm text-zinc-400 mb-1">Phone</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-zinc-400 mb-1">Password</label>
            <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="passwordConfirm" className="block text-sm text-zinc-400 mb-1">Confirm Password</label>
            <input id="passwordConfirm" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Confirm password" type="password" className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700" />
          </div>
        </div>

        <div className="text-xs text-zinc-500 mb-3 mt-2">By creating an artist account you confirm you own the rights to your music.</div>
        <button disabled={loading} className="w-full btn-cta bg-emerald-400 text-black">{loading ? 'Creating...' : 'Create Artist Account'}</button>
      </form>
    </main>
  );
}
