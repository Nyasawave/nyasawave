"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import GlobalSearch from "./GlobalSearch";
import PersonaSwitcher from "./PersonaSwitcher";
import { useSession, signOut } from "next-auth/react";
import { isArtist, isAdmin } from "@/app/utils/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const userIsArtist = isArtist(user && user.roles ? user : undefined);
  const userIsAdmin = isAdmin(user && user.roles ? user : undefined);

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-black/70 border-b border-zinc-800">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 gap-4">
        {/* LOGO */}
        <div className="flex items-center gap-4 min-w-max">
          <Logo />
          <span className="hidden sm:inline text-zinc-400 text-sm">African sounds — homegrown</span>
        </div>

        {/* SEARCH - hidden on mobile */}
        <div className="hidden lg:block flex-1 max-w-md">
          <GlobalSearch />
        </div>

        {/* LINKS - desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/discover" className="text-zinc-300 hover:text-white transition hover:underline">
            Discover
          </Link>
          <Link href="/artists" className="text-zinc-300 hover:text-white transition hover:underline">
            Artists
          </Link>
          <Link href="/playlists" className="text-zinc-300 hover:text-white transition hover:underline">
            Playlists
          </Link>
          <Link href="/business" className="text-zinc-300 hover:text-white transition hover:underline">
            For Business
          </Link>
          {userIsArtist && (
            <Link href="/upload" className="text-zinc-300 hover:text-white transition hover:underline">
              Upload
            </Link>
          )}
        </div>

        {/* Right side / CTA */}
        <div className="flex items-center gap-4">
          {/* Persona Switcher (admin only) */}
          {userIsAdmin && (
            <PersonaSwitcher />
          )}

          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/me" className="text-zinc-300 text-sm hover:text-white">Profile</Link>
                {userIsArtist && <Link href="/artist/dashboard" className="text-zinc-300 text-sm hover:text-white">Dashboard</Link>}
                <Link href="/subscribe" className="text-sm text-emerald-400">{user.premiumListener ? 'Premium' : 'Free'}</Link>
                <button onClick={() => signOut()} className="text-sm text-zinc-400 hover:text-white">Sign out</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/signin" className="btn-cta bg-emerald-400 text-black">Sign In</Link>
                <Link href="/register" className="text-zinc-300 text-sm hover:text-white border border-zinc-600 px-4 py-2 rounded hover:bg-zinc-800 transition">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((s) => !s)}
            className="md:hidden p-2 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {open ? (
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black/80 border-t border-zinc-800">
          <div className="px-4 py-3 flex flex-col gap-2">
            <Link href="/discover" className="text-zinc-300 hover:text-white py-2">Discover</Link>
            <Link href="/artists" className="text-zinc-300 hover:text-white py-2">Artists</Link>
            <Link href="/playlists" className="text-zinc-300 hover:text-white py-2">Playlists</Link>
            <Link href="/business" className="text-zinc-300 hover:text-white py-2">For Business</Link>
            {userIsArtist && (
              <Link href="/upload" className="text-zinc-300 hover:text-white py-2">Upload</Link>
            )}
            <div className="border-t border-zinc-800 mt-2 pt-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link href="/me" className="text-zinc-300 hover:text-white py-2">My Profile</Link>
                  {userIsArtist && <Link href="/artist/dashboard" className="text-zinc-300 hover:text-white py-2">Dashboard</Link>}
                  <Link href="/subscribe" className="text-emerald-400 py-2">{user.premiumListener ? 'Premium' : 'Free'}</Link>
                  <button onClick={() => { signOut(); setOpen(false); }} className="text-left text-zinc-400 hover:text-white py-2">Sign out</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/signin" onClick={() => setOpen(false)} className="block rounded-full bg-emerald-400 px-4 py-2 text-black text-center font-semibold">Sign In</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="block rounded-full border border-zinc-600 px-4 py-2 text-zinc-300 text-center font-semibold hover:bg-zinc-800 transition">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}