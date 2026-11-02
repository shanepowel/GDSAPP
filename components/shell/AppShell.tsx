/**
 * Numbered journey nav. The engagement is context in the top bar
 * rather than the top-level container.
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import { ThemeToggle } from '@/components/product/ThemeToggle';
import { DatumShellProvider } from '@/components/shell/datum-shell-context';
import { SkipLink } from '@/components/library/SkipLink';
import { TourBar } from '@/components/shell/TourBar';
import { TeachToggle } from '@/components/teach/TeachToggle';
import { DemoBanner } from '@/components/shell/DemoBanner';
import { StageChrome } from '@/components/shell/StageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { fillCopy } from '@/lib/copy';
import { lifecycleLabels } from '@/components/engagement/shared';
import { lifecycleStageForPhase } from '@/lib/attention/lifecycle';
import { stageDefForPath } from '@/lib/explain/stages';
import { trpc } from '@/lib/trpc/client';
import type { MaturityLevel } from '@/lib/playbook/keel';

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

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1] ?? null;
}

function toContext(e: {
  id: string;
  name: string;
  phase: string | null;
  maturityLevel?: string | null;
  standardId?: string | null;
}): EngagementContext {
  const standards = [
    e.standardId === 'wales' ? 'Wales DSS' : e.standardId === 'gds' ? 'GDS' : e.standardId,
  ].filter((v): v is string => Boolean(v));
  return {
    id: e.id,
    name: e.name,
    phase: e.phase ?? 'discovery',
    standards: standards.length ? standards : ['-'],
    maturityLevel: (e.maturityLevel as MaturityLevel) ?? 'practising',
  };
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
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user);
  const { data: liveList } = trpc.engagement.list.useQuery(undefined, { enabled: signedIn });

  const fromPath = pathname.match(/^\/(?:squads|assurance|engagements)\/([^/]+)/)?.[1];
  const cookieId = readCookie(ENGAGEMENT_COOKIE);
  const liveContexts = (liveList ?? []).map((e) =>
    toContext({
      id: e.id,
      name: e.name,
      phase: e.phase,
      maturityLevel: (e as { maturityLevel?: string }).maturityLevel,
      standardId: e.standardId,
    }),
  );
  const contexts = engagements?.length ? engagements : liveContexts;
  const selectedId = fromPath ?? cookieId ?? engagement?.id ?? contexts[0]?.id;
  const contextEngagement =
    engagement ?? contexts.find((e) => e.id === selectedId) ?? contexts[0];
  const showStrip = Boolean(contextEngagement && (signedIn || stageDefForPath(pathname)));

  return (
    <DatumShellProvider>
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
        <SkipLink>{c.ui.skipToContent}</SkipLink>
        <aside className="sticky top-0 z-20 flex h-auto flex-col border-b border-[color:var(--on-navy-rule)] bg-[var(--navy)] text-[color:var(--on-navy)] md:h-screen md:border-b-0 md:border-r md:border-r-[color:var(--on-navy-rule)]">
          <div className="border-b border-[color:var(--on-navy-rule)] px-5 pb-5 pt-6">
            <Link href="/" className="block">
              <span className="block text-[22px] font-bold leading-none tracking-[0.01em]">
                {c.product.name}
              </span>
              <span className="mt-2 block text-[12px] text-[color:var(--on-navy-mute)]">
                {c.product.owner}
              </span>
            </Link>
          </div>

          <ShellNav signedIn={signedIn} />

          <div className="border-t border-[color:var(--on-navy-rule)] px-5 py-3">
            <TeachToggle />
          </div>
          <div className="border-t border-[color:var(--on-navy-rule)] px-5 py-3">
            <Link
              href="/ai-use"
              aria-current={pathname.startsWith('/ai-use') ? 'page' : undefined}
              className="inline-flex min-h-11 items-center text-[13px] font-medium text-[color:var(--on-navy)]"
            >
              {c.shell.ask}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--on-navy-rule)] px-5 py-3 text-[13px]">
            <LanguageSwitcher />
            <ThemeToggle />
            {signedIn ? (
              <>
                <Link href={accountHref} className="ml-auto text-[color:var(--on-navy)]">
                  {accountLabel ?? c.home.signIn}
                </Link>
                <button
                  type="button"
                  className="text-[color:var(--on-navy)]"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  {c.ui.signOut}
                </button>
              </>
            ) : (
              <Link href={accountHref} className="ml-auto text-[color:var(--on-navy)]">
                {accountLabel ?? c.home.signIn}
              </Link>
            )}
          </div>
          <div className="px-5 pb-3.5 text-[12px] text-[color:var(--on-navy-mute)]">
            {c.footer.demonstration}
            <br />
            {c.footer.representative}
          </div>
        </aside>

        <main id="main-content" tabIndex={-1} className="min-w-0 bg-[var(--stock)]">
          <DemoBanner />
          {showStrip && contextEngagement ? (
            <ContextBar
              engagement={contextEngagement}
              engagements={contexts.length ? contexts : [contextEngagement]}
            />
          ) : null}
          <div className="max-w-[1200px] px-4 pb-28 pt-7 md:px-8">
            <StageChrome pathname={pathname}>{children}</StageChrome>
          </div>
        </main>
      </div>
      {showTour ? <TourBar engagementId={contextEngagement?.id} /> : null}
    </DatumShellProvider>
  );
}

const SHELL_LINKS = [
  { href: '/', key: 'home' },
  { href: '/squads', key: 'engagements' },
  { href: '/people', key: 'people' },
  { href: '/roles', key: 'capability' },
  { href: '/practice', key: 'playbook' },
  { href: '/portfolio', key: 'portfolio' },
  { href: '/practice/standards', key: 'standards' },
  { href: '/settings', key: 'settings' },
] as const;

function shellActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/practice') {
    return (
      pathname === '/practice' ||
      (pathname.startsWith('/practice/') && !pathname.startsWith('/practice/standards'))
    );
  }
  if (href === '/practice/standards') {
    return (
      pathname.startsWith('/practice/standards') ||
      pathname.startsWith('/framework') ||
      pathname.startsWith('/assurance')
    );
  }
  if (href === '/squads') {
    return pathname.startsWith('/squads') || pathname.startsWith('/engagements');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ShellNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const { locale } = useI18n();
  const c = getCopy(locale);
  const links = SHELL_LINKS.filter((item) => item.key !== 'settings' || signedIn);

  return (
    <nav aria-label={c.shell.navLabel} className="flex-1 py-3">
      <ul className="flex gap-1 overflow-x-auto px-3 md:flex-col md:overflow-visible md:px-0">
        {links.map((item) => {
          const active = shellActive(pathname, item.href);
          return (
            <li key={item.href} className="shrink-0 md:shrink">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex min-h-11 items-center border-l-[3px] px-4 text-[14px] text-[color:var(--on-navy)] md:px-5',
                  active
                    ? 'border-l-[color:var(--blue)] bg-[var(--on-navy-active)] font-semibold'
                    : 'border-l-transparent hover:bg-[var(--on-navy-hover)]',
                ].join(' ')}
              >
                {c.shell[item.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
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
  const levelKey = (['practising', 'evidenced', 'assured', 'compounding'][level - 1] ??
    'practising') as MaturityLevel;
  const maturityName = c.maturityLevels[levelKey];
  const stage = lifecycleStageForPhase(engagement.phase);
  const phaseLabel =
    engagement.id === 'nrw-demo' ? c.context.demoPhase : stage ? lifecycleLabels(c)[stage] : engagement.phase;
  const standardsLabel =
    engagement.id === 'nrw-demo' ? c.context.demoStandards : engagement.standards.join(' · ') || '-';

  return (
    <div className="flex flex-wrap items-baseline gap-6 border-b border-[color:var(--rule)] bg-[var(--raised)] px-4 py-3.5 md:px-8">
      <Field label={c.context.engagement}>
        {engagements.length > 1 ? (
          <select
            value={engagement.id}
            aria-label={c.context.changeEngagement}
            className="rounded-[var(--radius)] border border-[color:var(--rule)] bg-[var(--raised)] px-2 py-1 text-[13px] font-semibold"
            onChange={(e) => {
              const next = e.target.value;
              document.cookie = `${ENGAGEMENT_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
              if (pathname.includes(engagement.id)) {
                router.push(pathname.replace(engagement.id, next));
              } else if (pathname.startsWith('/assurance')) {
                router.push(`/assurance/${next}`);
              } else if (pathname.startsWith('/practice') || pathname.startsWith('/roles') || pathname.startsWith('/people')) {
                router.refresh();
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
      <Field label={c.context.phase}>{phaseLabel}</Field>
      <Field label={c.context.standards}>{standardsLabel}</Field>
      <div className="flex-1" />
      <Field label={c.context.maturity}>
        {fillCopy(c.context.maturityValue, { level, name: maturityName })}
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-[13px]">
      <span className="block text-[12px] text-[color:var(--graphite)]">
        {label}
      </span>
      {children}
    </div>
  );
}
