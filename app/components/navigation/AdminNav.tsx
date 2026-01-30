'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/roles', label: 'Roles', icon: '🔐' },
    { href: '/admin/content', label: 'Music', icon: '🎵' },
    { href: '/marketplace', label: 'Marketplace', icon: '🛍️' },
    { href: '/admin/tournaments', label: 'Tournaments', icon: '🏆' },
    { href: '/admin/payments', label: 'Payments', icon: '💳' },
    { href: '/admin/reports', label: 'Analytics', icon: '📈' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminNav({ isMobile }: { isMobile?: boolean }) {
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
