'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/artists', label: 'Artists', icon: '🎤' },
    { href: '/admin/content', label: 'Content', icon: '🎵' },
    { href: '/admin/tournaments', label: 'Tournaments', icon: '🏆' },
    { href: '/admin/reports', label: 'Reports', icon: '📈' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminNav() {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href || pathname.startsWith(href);

    return (
        <nav className="flex gap-1 lg:gap-4 overflow-x-auto pb-2 lg:pb-0">
            {adminLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-sm lg:text-base ${isActive(link.href)
                        ? 'bg-blue-600 text-white'
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
