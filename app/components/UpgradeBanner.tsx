'use client';

import Link from 'next/link';
import { usePlayer } from '@/context/PlayerContext';

export default function UpgradeBanner() {
  const { isPremium } = usePlayer();

  if (isPremium) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 text-center sticky top-0 z-40">
      🎵 Download music, support artists & unlock premium features.
      <Link href="/subscribe" className="ml-3 underline font-semibold hover:opacity-80 transition">
        Go Premium →
      </Link>
    </div>
  );
}
