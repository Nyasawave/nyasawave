'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const marketerLinks = [
    { href: '/marketer/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/marketplace', label: 'Marketplace', icon: '🛍️' },
    { href: '/marketer/artists', label: 'Artists', icon: '🎤' },
    { href: '/marketer/earnings', label: 'Sales', icon: '📈' },
    { href: '/marketplace/chat', label: 'Chat', icon: '💬' },
    { href: '/marketer/earnings', label: 'Wallet', icon: '💰' },
    { href: '/marketer/settings', label: 'Settings', icon: '⚙️' },
];

export default function MarketerNav({ isMobile }: { isMobile?: boolean }) {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href || pathname.startsWith(href);

    return (
        <nav className="flex gap-1 lg:gap-4 overflow-x-auto pb-2 lg:pb-0">
            {marketerLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-sm lg:text-base ${isActive(link.href)
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                >
                    <span>{link.icon}</span>
                    <span className="hidden sm:inline">{link.label}</span>
                </Link>
            ))}
        </nav>
    );
}
