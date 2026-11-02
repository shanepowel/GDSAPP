'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

/** Link tabs. Active tab is the longest href that matches the URL. */
export function TabNav({ items, label }: { items: { href: string; label: string }[]; label: string }) {
  const pathname = usePathname();
  const active = [...items].sort((a, b) => b.href.length - a.href.length).find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  return (
    <nav aria-label={label} className="flex flex-wrap gap-1 border-b border-asm-line-strong">
      {items.map((i) => {
        const on = active?.href === i.href;
        return (
          <Link key={i.href} href={i.href} aria-current={on ? 'page' : undefined} className={cn('-mb-px px-4 py-3 text-[15px]', on ? 'border-b-2 border-asm-brand font-semibold text-asm-brand' : 'text-asm-ink-2 hover:text-asm-brand')}>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
