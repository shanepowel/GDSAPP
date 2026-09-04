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
import { TourBar } from '@/components/shell/TourBar';
import { TeachToggle } from '@/components/teach/TeachToggle';
import { DemoBanner } from '@/components/shell/DemoBanner';
import { StageChrome } from '@/components/shell/StageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { fillCopy } from '@/lib/copy';
import { STAGE_DEFS, stageDefForPath } from '@/lib/explain/stages';
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
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[216px_1fr]">
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

          <JourneyNav engagementId={contextEngagement?.id} />

          <div className="border-t border-[color:var(--on-navy-rule)] px-5 py-3">
            <TeachToggle />
          </div>
          <div className="flex items-center gap-2 border-t border-[color:var(--on-navy-rule)] px-5 py-3 text-[13px]">
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

        <main className="min-w-0 bg-[var(--stock)]">
          <DemoBanner />
          {showStrip && contextEngagement ? (
            <ContextBar
              engagement={contextEngagement}
              engagements={contexts.length ? contexts : [contextEngagement]}
            />
          ) : null}
          <div className="max-w-[1120px] px-4 pb-28 pt-7 md:px-8">
            <StageChrome pathname={pathname}>{children}</StageChrome>
          </div>
        </main>
      </div>
      {showTour ? <TourBar engagementId={contextEngagement?.id} /> : null}
    </DatumShellProvider>
  );
}

function JourneyNav({ engagementId }: { engagementId?: string }) {
  const pathname = usePathname();
  const { locale } = useI18n();
  const c = getCopy(locale);
  const current = stageDefForPath(pathname);

  return (
    <nav aria-label={c.nav.stages} className="flex flex-1 flex-col py-3">
      <ol className="journey-stepper md:hidden">
        {STAGE_DEFS.map((s) => {
          const active = s.id === current?.id;
          return (
            <li key={s.id}>
              <Link
                href={stageHref(s, engagementId)}
                aria-current={active ? 'page' : undefined}
                className={active ? 'is-active' : undefined}
              >
                <span className="journey-n">{s.number}</span>
                <span className="sr-only">{c.journey[s.id].label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <ol className="hidden md:block">
        {STAGE_DEFS.map((s) => {
          const active = s.id === current?.id;
          const item = c.journey[s.id];
          return (
            <li key={s.id}>
              <Link
                href={stageHref(s, engagementId)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex min-h-11 flex-col justify-center border-l-[3px] px-5 py-2 text-sm text-[color:var(--on-navy)]',
                  active
                    ? 'border-l-[color:var(--blue)] bg-[var(--on-navy-active)] font-semibold'
                    : 'border-l-transparent hover:bg-[var(--on-navy-hover)]',
                ].join(' ')}
              >
                <span>
                  {s.number} {item.label}
                </span>
                <span className="mt-px text-[12.5px] text-[color:var(--on-navy-mute)]">
                  {item.hint}
                </span>
              </Link>
              {s.extraHrefs?.map((extra) => (
                <Link
                  key={extra.href}
                  href={extra.href}
                  className="ml-8 block py-1 text-[12px] text-[color:var(--on-navy-mute)] hover:text-[color:var(--on-navy)]"
                >
                  {c.journey[extra.copyKey]}
                </Link>
              ))}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function stageHref(
  stage: (typeof STAGE_DEFS)[number],
  engagementId?: string,
): string {
  if (stage.id === 'assemble' && engagementId) return `/squads/${engagementId}`;
  if (stage.id === 'assure' && engagementId) return `/assurance/${engagementId}`;
  return stage.href;
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
  const phaseLabel = engagement.id === 'nrw-demo' ? c.context.demoPhase : engagement.phase;
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
