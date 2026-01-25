"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      // Mock subscription
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-emerald-900/10 to-emerald-900/5 p-6">
      <h3 className="font-semibold mb-2">Stay Updated</h3>
      <p className="text-sm text-zinc-400 mb-4">Get new releases and artist spotlights in your inbox.</p>
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-emerald-400 text-black px-4 py-2 rounded font-semibold hover:bg-emerald-300 disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
      {status === "success" && <p className="text-xs text-emerald-400 mt-2">✓ Subscribed!</p>}
      {status === "error" && <p className="text-xs text-red-400 mt-2">✗ Invalid email or error</p>}
    </div>
  );
}
