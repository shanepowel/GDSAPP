'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';

export function AppNav() {
  const pathname = usePathname();
  const features = getClientDeploymentFeatures();

  const links = [
    { href: '/engagements', label: 'Engagements' },
    {
      href: '/portfolio',
      label: features.clientAssuranceLabels ? 'Portfolio assurance' : 'Portfolio',
      highlight: features.clientAssuranceLabels,
    },
    { href: '/handover', label: 'Handover pack' },
  ];

  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-border" aria-label="Main">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className="-mb-px px-4 py-2 text-sm font-medium transition-colors"
            style={{
              color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
              borderBottom: active ? '2px solid var(--color-brand)' : '2px solid transparent',
            }}
          >
            {link.label}
            {link.highlight && (
              <span className="ml-1.5 text-[10px] font-semibold uppercase text-brand-hover">
                Key
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
