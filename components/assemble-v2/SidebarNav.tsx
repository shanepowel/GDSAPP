'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Compass, GraduationCap, Home, Layers, Settings, ShieldCheck, Users } from 'lucide-react';
import { cn } from '@/lib/assemble-v2/cn';

export const NAV = [
  { href: '/v2/home', label: 'Home', icon: Home },
  { href: '/v2/engagements', label: 'Engagements', icon: Layers },
  { href: '/v2/people', label: 'People', icon: Users },
  { href: '/v2/capability', label: 'Capability', icon: GraduationCap },
  { href: '/v2/playbook', label: 'Playbook', icon: BookOpen },
  { href: '/v2/portfolio', label: 'Portfolio', icon: Compass },
  { href: '/v2/standards', label: 'Standards', icon: ShieldCheck },
  { href: '/v2/settings', label: 'Settings', icon: Settings },
];

/** Primary navigation. The active item is derived from the URL. */
export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-asm px-3 py-3 text-[15px]',
              active ? 'bg-asm-brand-hover font-semibold text-asm-on-brand' : 'text-asm-on-brand-2 hover:bg-asm-brand-hover hover:text-asm-on-brand',
            )}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
