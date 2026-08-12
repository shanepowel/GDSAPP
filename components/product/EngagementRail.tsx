'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/app/LocaleProvider';

const PRIMARY: { href: string; labelKey: keyof typeof LABELS_EN }[] = [
  { href: '', labelKey: 'overview' },
  { href: '/assess', labelKey: 'assess' },
  { href: '/organise', labelKey: 'organise' },
  { href: '/evidence', labelKey: 'evidence' },
  { href: '/assure', labelKey: 'assure' },
  { href: '/report', labelKey: 'report' },
];

const SECONDARY: { href: string; labelKey: keyof typeof LABELS_EN }[] = [
  { href: '/activity', labelKey: 'activity' },
  { href: '/settings', labelKey: 'settings' },
];

const LABELS_EN = {
  overview: 'Overview',
  assess: 'Assess',
  organise: 'Organise',
  evidence: 'Evidence',
  assure: 'Assure',
  report: 'Report',
  activity: 'Activity',
  settings: 'Settings',
} as const;

const LABELS_CY: Record<keyof typeof LABELS_EN, string> = {
  overview: 'Trosolwg',
  assess: 'Asesu',
  organise: 'Trefnu',
  evidence: 'Tystiolaeth',
  assure: 'Sicrhau',
  report: 'Adroddiad',
  activity: 'Gweithgarwch',
  settings: 'Gosodiadau',
};

function RailLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-[13px] font-medium transition-colors"
      style={{
        color: active ? 'var(--signal-ink)' : 'var(--ink-1)',
        borderLeft: active ? '2px solid var(--signal)' : '2px solid transparent',
        background: active ? 'var(--signal-wash)' : 'transparent',
      }}
    >
      {label}
    </Link>
  );
}

export function EngagementRail({ engagementId }: { engagementId: string }) {
  const pathname = usePathname();
  const { locale } = useI18n();
  const labels = locale === 'cy' ? LABELS_CY : LABELS_EN;
  const base = `/engagements/${engagementId}`;

  function isActive(suffix: string) {
    const href = `${base}${suffix}`;
    if (!suffix) return pathname === base;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      className="flex w-full flex-row gap-1 overflow-x-auto border-b border-rule md:w-56 md:shrink-0 md:flex-col md:gap-0 md:overflow-visible md:border-b-0 md:border-r md:pr-0"
      aria-label="Engagement"
    >
      <div className="flex min-w-max md:block md:min-w-0 md:py-2">
        {PRIMARY.map((item) => (
          <RailLink
            key={item.href}
            href={`${base}${item.href}`}
            label={labels[item.labelKey]}
            active={isActive(item.href)}
          />
        ))}
      </div>
      <div className="mx-2 hidden border-t border-rule md:mx-3 md:my-2 md:block" />
      <div className="flex min-w-max md:block md:min-w-0">
        {SECONDARY.map((item) => (
          <RailLink
            key={item.href}
            href={`${base}${item.href}`}
            label={labels[item.labelKey]}
            active={isActive(item.href)}
          />
        ))}
      </div>
    </nav>
  );
}
