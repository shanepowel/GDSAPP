/**
 * Five primary sections, no dropdowns. The engagement is context in the top bar
 * rather than the top-level container.
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import { ThemeToggle } from '@/components/product/ThemeToggle';
import { DatumShellProvider } from '@/components/shell/datum-shell-context';
import { TourBar } from '@/components/shell/TourBar';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { MATURITY_LABELS, type MaturityLevel } from '@/lib/playbook/keel';

const SECTIONS = [
  { key: 'practice', href: '/', match: /^\/$|^\/practice(\/|$)/ },
  { key: 'people', href: '/people', match: /^\/people/ },
  { key: 'squads', href: '/squads', match: /^\/squads/ },
  { key: 'assurance', href: '/assurance', match: /^\/assurance/ },
  { key: 'portfolio', href: '/portfolio', match: /^\/portfolio/ },
] as const;

export const ENGAGEMENT_COOKIE = 'datum-engagement';

export interface EngagementContext {
  id: string;
  name: string;
  phase: string;
  standards: string[];
  maturityLevel: 1 | 2 | 3 | 4 | string;
}

function maturityNumber(level: string | number): number {
  if (typeof level === 'number') return level;
  const order: MaturityLevel[] = ['practising', 'evidenced', 'assured', 'compounding'];
  const idx = order.indexOf(level as MaturityLevel);
  return idx >= 0 ? idx + 1 : 1;
}

export function DatumAppShell({
  engagement,
  engagements,
  children,
  showTour = true,
  accountHref = '/sign-in',
  accountLabel,
}: {
  engagement?: EngagementContext;
  engagements?: EngagementContext[];
  children: React.ReactNode;
  showTour?: boolean;
  accountHref?: string;
  accountLabel?: string;
}) {
  const pathname = usePathname();
  const { locale } = useI18n();
  const c = getCopy(locale);

  return (
    <DatumShellProvider>
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[216px_1fr]">
        <aside className="sticky top-0 z-20 flex h-auto flex-col border-b border-[color:var(--rule)] bg-[var(--stock)] md:h-screen md:border-b-0 md:border-r">
          <div className="border-b border-[color:var(--rule)] px-5 pb-5 pt-6">
            <Link href="/" className="block">
              <span className="block font-[family-name:var(--font-cond)] text-[22px] font-bold uppercase leading-none tracking-[0.14em]">
                {c.product.name}
              </span>
              <span className="mt-2 block font-[family-name:var(--font-mono)] text-[9.5px] uppercase tracking-[0.1em] text-[color:var(--graphite)]">
                {c.product.owner}
              </span>
            </Link>
          </div>

          <nav aria-label="Sections" className="flex flex-1 flex-wrap py-3 md:block">
            {SECTIONS.map((s) => {
              const active = s.match.test(pathname);
              const item = c.nav[s.key];
              const href =
                s.key === 'assurance' && engagement
                  ? `/assurance/${engagement.id}`
                  : s.key === 'squads' && engagement
                    ? `/squads/${engagement.id}`
                    : s.href;
              return (
                <Link
                  key={s.key}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'block border-l-[3px] px-5 py-2.5 text-sm md:w-full',
                    active
                      ? 'border-l-[color:var(--survey)] bg-[var(--raised)] font-semibold'
                      : 'border-l-transparent hover:bg-[var(--raised)]',
                  ].join(' ')}
                >
                  {item.label}
                  <span className="mt-px hidden font-[family-name:var(--font-mono)] text-[10px] text-[color:var(--graphite)] md:block">
                    {item.hint}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 border-t border-[color:var(--rule)] px-5 py-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href={accountHref}
              className="ml-auto font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.1em]"
            >
              {accountLabel ?? c.home.signIn}
            </Link>
          </div>
          <div className="px-5 pb-3.5 font-[family-name:var(--font-mono)] text-[10px] text-[color:var(--graphite)]">
            {c.footer.demonstration}
            <br />
            {c.footer.representative}
          </div>
        </aside>

        <main className="min-w-0 bg-[var(--stock)]">
          {engagement && (
            <ContextBar engagement={engagement} engagements={engagements ?? [engagement]} />
          )}
          <div className="max-w-[1120px] px-4 pb-28 pt-7 md:px-8">{children}</div>
        </main>
      </div>
      {showTour ? <TourBar engagementId={engagement?.id} /> : null}
    </DatumShellProvider>
  );
}

function ContextBar({
  engagement,
  engagements,
}: {
  engagement: EngagementContext;
  engagements: EngagementContext[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();
  const c = getCopy(locale);
  const level = maturityNumber(engagement.maturityLevel);
  const maturityName =
    MATURITY_LABELS[
      (['practising', 'evidenced', 'assured', 'compounding'][level - 1] ?? 'practising') as MaturityLevel
    ];

  return (
    <div className="flex flex-wrap items-baseline gap-6 border-b border-[color:var(--rule)] bg-[var(--raised)] px-4 py-3.5 md:px-8">
      <Field label={c.context.engagement}>
        {engagements.length > 1 ? (
          <select
            defaultValue={engagement.id}
            aria-label={c.context.changeEngagement}
            className="bg-transparent font-[family-name:var(--font-mono)] text-[11px]"
            onChange={(e) => {
              const next = e.target.value;
              document.cookie = `${ENGAGEMENT_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
              if (pathname.includes(engagement.id)) {
                router.push(pathname.replace(engagement.id, next));
              } else if (pathname.startsWith('/assurance')) {
                router.push(`/assurance/${next}`);
              } else {
                router.push(`/squads/${next}`);
              }
            }}
          >
            {engagements.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : (
          engagement.name
        )}
      </Field>
      <Field label={c.context.phase}>{engagement.phase}</Field>
      <Field label={c.context.standards}>{engagement.standards.join(' · ') || '—'}</Field>
      <div className="flex-1" />
      <Field label={c.context.maturity}>
        Level {level} {maturityName}
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="font-[family-name:var(--font-mono)] text-[11px]">
      <span className="block text-[9.5px] uppercase tracking-[0.12em] text-[color:var(--graphite)]">
        {label}
      </span>
      {children}
    </div>
  );
}
