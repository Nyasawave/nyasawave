'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const listenerLinks = [
    { href: '/discover', label: 'Discover', icon: '🔍' },
    { href: '/listener/library', label: 'Library', icon: '📋' },
    { href: '/listener/profile', label: 'Profile', icon: '👤' },
    { href: '/listener/settings', label: 'Settings', icon: '⚙️' },
];

export default function ListenerNav() {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href || pathname.startsWith(href);

    return (
        <nav className="flex gap-1 lg:gap-4 overflow-x-auto pb-2 lg:pb-0">
            {listenerLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-sm lg:text-base ${isActive(link.href)
                        ? 'bg-green-600 text-white'
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
