'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const entrepreneurLinks = [
    { href: '/entrepreneur/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/marketplace', label: 'Marketplace', icon: '🛍️' },
    { href: '/marketplace/products', label: 'Listings', icon: '📦' },
    { href: '/orders', label: 'Orders', icon: '📋' },
    { href: '/marketplace/chat', label: 'Chat', icon: '💬' },
    { href: '/entrepreneur/payments', label: 'Wallet', icon: '💰' },
    { href: '/entrepreneur/settings', label: 'Settings', icon: '⚙️' },
];

export default function EntrepreneurNav({ isMobile }: { isMobile?: boolean }) {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href || pathname.startsWith(href);

    return (
        <nav className="flex gap-1 lg:gap-4 overflow-x-auto pb-2 lg:pb-0">
            {entrepreneurLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-sm lg:text-base ${isActive(link.href)
                        ? 'bg-orange-600 text-white'
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
