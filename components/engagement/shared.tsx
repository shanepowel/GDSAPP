'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AttentionCode } from '@/lib/attention/facts';
import type { LifecycleStage } from '@/lib/attention/lifecycle';
import { LIFECYCLE_STAGES } from '@/lib/attention/lifecycle';
import type { NextActionCode } from '@/lib/attention/next-action';
import type { Copy } from '@/lib/copy';

export function lifecycleLabels(copy: Copy): Record<LifecycleStage, string> {
  return {
    shape: copy.lifecycle.shape,
    'sprint-zero': copy.lifecycle.sprintZero,
    discovery: copy.lifecycle.discovery,
    alpha: copy.lifecycle.alpha,
    beta: copy.lifecycle.beta,
    live: copy.lifecycle.live,
    operate: copy.lifecycle.operate,
  };
}

export function statusLabel(copy: Copy, status: 'on-track' | 'at-risk' | 'off-track'): string {
  if (status === 'at-risk') return copy.status.atRisk;
  if (status === 'off-track') return copy.status.offTrack;
  return copy.status.onTrack;
}

export function stageLinks(id: string): Record<LifecycleStage, string> {
  return Object.fromEntries(LIFECYCLE_STAGES.map((stage) => [stage, `/squads/${id}/stage/${stage}`])) as Record<
    LifecycleStage,
    string
  >;
}

export function showDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00.000Z`));
}

const TABS = [
  { key: 'overview', href: (id: string) => `/squads/${id}/overview` },
  { key: 'squad', href: (id: string) => `/squads/${id}` },
  { key: 'plan', href: (id: string) => `/squads/${id}/plan` },
  { key: 'compass', href: (id: string) => `/squads/${id}/compass` },
  { key: 'decisions', href: (id: string) => `/squads/${id}/decisions` },
  { key: 'change', href: (id: string) => `/squads/${id}/change` },
  { key: 'standards', href: (id: string) => `/assurance/${id}` },
] as const;

export function EngagementTabs({ id, copy }: { id: string; copy: Copy }) {
  const pathname = usePathname();
  return (
    <nav aria-label={copy.spine.tabs.label} className="mb-6">
      <ul className="flex gap-1 overflow-x-auto border-b border-[color:var(--rule)]">
        {TABS.map((tab) => {
          const href = tab.href(id);
          const active =
            tab.key === 'squad'
              ? pathname === href || pathname.startsWith(`${href}/roles`) || pathname.startsWith(`${href}/gaps`)
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={tab.key}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className="inline-flex min-h-11 items-center px-3 text-[14px]"
                style={{
                  color: 'var(--ink)',
                  fontWeight: active ? 600 : 400,
                  borderBottom: active ? '3px solid var(--brand)' : '3px solid transparent',
                }}
              >
                {copy.spine.tabs[tab.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function actionHref(id: string, code: NextActionCode): string {
  switch (code) {
    case 'risk-lock':
    case 'recovery':
    case 'monthly-report':
    case 'survey':
      return `/squads/${id}/compass`;
    case 'steering-pack':
    case 'confirm-decisions':
      return `/squads/${id}/decisions`;
    case 'sprint-zero':
      return `/squads/${id}/stage/sprint-zero`;
    case 'triage-change':
    case 'assess-change':
    case 'aftercare':
      return `/squads/${id}/change`;
    case 'keel-end':
      return '/people';
    case 'charter-review':
    case 'on-track':
      return `/squads/${id}/overview`;
    default: {
      const neverCode: never = code;
      return neverCode;
    }
  }
}

export function actionLabel(copy: Copy, code: NextActionCode, survey: string | number | undefined): string {
  switch (code) {
    case 'risk-lock':
      return copy.spine.bookRiskLock;
    case 'recovery':
      return copy.spine.rowAction['at-risk'];
    case 'steering-pack':
      return copy.spine.rowAction.steering;
    case 'confirm-decisions':
      return copy.spine.confirm;
    case 'sprint-zero':
      return copy.spine.rowAction['sprint-overdue'];
    case 'triage-change':
      return copy.spine.markTriaged;
    case 'assess-change':
      return copy.spine.markAssessed;
    case 'aftercare':
      return copy.spine.setAftercare;
    case 'monthly-report':
      return copy.spine.draftReport;
    case 'survey':
      return survey === 'pulse' ? copy.spine.sendPulse : copy.spine.sendHealth;
    case 'charter-review':
      return copy.spine.markAgreed;
    case 'keel-end':
    case 'on-track':
      return copy.attention.open;
    default: {
      const neverCode: never = code;
      return neverCode;
    }
  }
}

export function rowHref(id: string, code: AttentionCode): string {
  switch (code) {
    case 'off-track':
    case 'at-risk':
    case 'report':
    case 'survey-health':
    case 'survey-pulse':
      return `/squads/${id}/compass`;
    case 'sprint-overdue':
      return `/squads/${id}/stage/sprint-zero`;
    case 'steering':
      return `/squads/${id}/decisions`;
    case 'change-triage':
    case 'change-assess':
      return `/squads/${id}/change`;
    default: {
      const neverCode: never = code;
      return neverCode;
    }
  }
}
