'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';

const BASE_LINKS = [
  { suffix: '', label: 'Overview' },
  { suffix: '/requirement', label: 'Requirement' },
  { suffix: '/team', label: 'Team' },
  { suffix: '/evidence', label: 'Evidence' },
  { suffix: '/rigour', label: 'Rigour' },
  { suffix: '/analysis', label: 'Analysis' },
  { suffix: '/tender', label: 'Call-off' },
  { suffix: '/judgements', label: 'Judgements' },
  { suffix: '/history', label: 'History' },
  { suffix: '/report', label: 'Report' },
] as const;

export function EngagementSubNav({ engagementId }: { engagementId: string }) {
  const pathname = usePathname();
  const features = getClientDeploymentFeatures();
  const base = `/engagements/${engagementId}`;
  const links = BASE_LINKS.map((l) => ({
    href: `${base}${l.suffix}`,
    label:
      l.suffix === '/tender' && features.clientAssuranceLabels
        ? 'Criteria'
        : l.label,
  }));

  return (
    <nav
      className="mb-6 flex gap-1 overflow-x-auto border-b border-border pb-px"
      aria-label="Engagement sections"
    >
      {links.map((link) => {
        const active =
          link.href === base
            ? pathname === base
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors"
            style={{
              color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
              borderBottom: active ? '2px solid var(--color-brand)' : '2px solid transparent',
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
