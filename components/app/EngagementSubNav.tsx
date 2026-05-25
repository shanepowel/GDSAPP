'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/app/LocaleProvider';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';

type Suffix = '' | '/requirement' | '/team' | '/evidence' | '/rigour' | '/analysis' | '/tender' | '/judgements' | '/reviews' | '/history' | '/report';

const GROUPS: { groupKey: 'navGroupPrepare' | 'navGroupAssess' | 'navGroupDecide' | 'navGroupShare'; suffixes: Suffix[] }[] = [
  { groupKey: 'navGroupPrepare', suffixes: ['', '/requirement', '/team', '/evidence'] },
  { groupKey: 'navGroupAssess', suffixes: ['/rigour', '/analysis'] },
  { groupKey: 'navGroupDecide', suffixes: ['/tender', '/judgements', '/reviews'] },
  { groupKey: 'navGroupShare', suffixes: ['/history', '/report'] },
];

export function EngagementSubNav({ engagementId }: { engagementId: string }) {
  const pathname = usePathname();
  const features = getClientDeploymentFeatures();
  const { messages: m } = useI18n();
  const base = `/engagements/${engagementId}`;

  const labels: Record<Suffix, string> = {
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

  return (
    <nav className="mb-6 space-y-4" aria-label="Engagement sections">
      {GROUPS.map(({ groupKey, suffixes }) => (
        <div key={groupKey}>
          <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            {m.engagement[groupKey]}
          </p>
          <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
            {suffixes.map((suffix) => {
              const href = `${base}${suffix}`;
              const active =
                href === base
                  ? pathname === base
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className="whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                    borderBottom: active
                      ? '2px solid var(--color-brand)'
                      : '2px solid transparent',
                  }}
                >
                  {labels[suffix]}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
