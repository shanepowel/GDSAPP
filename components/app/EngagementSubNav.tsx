'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/app/LocaleProvider';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';

const SUFFIXES = [
  '',
  '/requirement',
  '/team',
  '/evidence',
  '/rigour',
  '/analysis',
  '/tender',
  '/judgements',
  '/reviews',
  '/history',
  '/report',
] as const;

export function EngagementSubNav({ engagementId }: { engagementId: string }) {
  const pathname = usePathname();
  const features = getClientDeploymentFeatures();
  const { messages: m } = useI18n();
  const base = `/engagements/${engagementId}`;
  const labels: Record<string, string> = {
    '': m.engagement.subOverview,
    '/requirement': m.engagement.subRequirement,
    '/team': m.engagement.subTeam,
    '/evidence': m.engagement.subEvidence,
    '/rigour': m.engagement.subRigour,
    '/analysis': m.engagement.subAnalysis,
    '/tender': features.clientAssuranceLabels
      ? m.engagement.subTenderAssurance
      : m.engagement.subTender,
    '/judgements': m.engagement.subJudgements,
    '/reviews': m.engagement.subReviews,
    '/history': m.engagement.subHistory,
    '/report': m.engagement.subReport,
  };
  const links = SUFFIXES.map((suffix) => ({
    href: `${base}${suffix}`,
    label: labels[suffix],
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
