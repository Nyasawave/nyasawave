"use client";

import { useState } from "react";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (res.ok) {
        setMessage('If an account exists we sent reset instructions. (Demo shows token below)');
        if (data.resetToken) setMessage((m) => `${m}\nReset token: ${data.resetToken}`);
      } else setMessage('Unable to process request');
    } catch (e) { setMessage('Network error'); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <form onSubmit={submit} className="w-full max-w-md bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800 p-6 rounded-2xl card-anim fade-in">
        <h1 className="text-2xl font-semibold mb-4">Forgot password</h1>
        {message && <div className="whitespace-pre-wrap text-sm text-zinc-300 mb-3">{message}</div>}
        <label htmlFor="forgot-email" className="block text-sm text-zinc-400 mb-2">Email</label>
        <input id="forgot-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your account email" className="w-full mb-3 px-3 py-2 rounded bg-zinc-800 border border-zinc-700" />
        <button className="w-full btn-cta bg-emerald-400 text-black">Send reset</button>
      </form>
    </main>
  );
}
