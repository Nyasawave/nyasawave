'use client';

import { usePlayer } from '@/context/PlayerContext';

export default function PremiumToggle() {
  const { isPremium, setIsPremium } = usePlayer();

  return (
    <button
      onClick={() => setIsPremium(!isPremium)}
      className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition z-40"
    >
      {isPremium ? '💎 Premium ON' : '🔓 Premium OFF'}
    </button>
  );
}
