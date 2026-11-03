/**
 * Numbered journey nav. The engagement is context in the top bar
 * rather than the top-level container.
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import { ThemeToggle } from '@/components/product/ThemeToggle';
import { DatumShellProvider } from '@/components/shell/datum-shell-context';
import { SkipLink } from '@/components/library/SkipLink';
import { AssembleMark, TurnerTownsendLogo } from '@/components/library/Logo';
import { BookOpen, Compass, GraduationCap, Home, Layers, Settings, ShieldCheck, Users } from 'lucide-react';
import { TourBar } from '@/components/shell/TourBar';
import { TeachToggle } from '@/components/teach/TeachToggle';
import { DemoBanner } from '@/components/shell/DemoBanner';
import { StageChrome } from '@/components/shell/StageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { fillCopy } from '@/lib/copy';
import { lifecycleLabels } from '@/components/engagement/shared';
import { maturityIndex, phaseDisplay, standardDisplayName } from '@/lib/labels';
import { trpc } from '@/lib/trpc/client';
import type { MaturityLevel } from '@/lib/playbook/keel';

export const ENGAGEMENT_COOKIE = 'datum-engagement';

export interface EngagementContext {
  id: string;
  name: string;
  phase: string;
  standards: string[];
  standardId?: string | null;
  maturityLevel: 1 | 2 | 3 | 4 | string;
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
  return {
    id: e.id,
    name: e.name,
    phase: e.phase ?? '',
    standards: [],
    standardId: e.standardId,
    maturityLevel: (e.maturityLevel as MaturityLevel) ?? '',
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
  const { locale, messages } = useI18n();
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
  const onEngagement = /^\/squads\/[^/]+/.test(pathname) || /^\/assurance\/[^/]+/.test(pathname);
  const showStrip = Boolean(signedIn && onEngagement && contextEngagement);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <DatumShellProvider>
      <div className="asm-root min-h-screen md:grid md:grid-cols-[256px_1fr]">
        <SkipLink>{c.ui.skipToContent}</SkipLink>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-asm-brand px-3 text-asm-on-brand md:hidden">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-asm"
            aria-expanded={menuOpen}
            aria-controls="app-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? c.ui.closeMenu : c.ui.menu}
          </button>
          <Link href="/" className="flex items-center gap-2 text-asm-on-brand no-underline">
            <AssembleMark size={24} />
            <span className="text-base font-bold">{c.product.name}</span>
          </Link>
        </header>
        {menuOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            aria-label={c.ui.closeMenu}
            onClick={() => setMenuOpen(false)}
          />
        ) : null}
        <aside
          id="app-nav"
          className={[
            'fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-asm-brand text-asm-on-brand transition-transform md:sticky md:top-0 md:z-20 md:h-screen md:w-auto md:translate-x-0',
            menuOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div className="px-5 pb-4 pt-6">
            <Link href="/" className="flex items-center gap-2.5 text-asm-on-brand no-underline">
              <AssembleMark />
              <span className="flex flex-col">
                <span className="text-lg font-bold leading-none tracking-tight">{c.product.name}</span>
                <span className="mt-1 text-[12px] text-asm-on-brand-3">{c.product.owner}</span>
              </span>
            </Link>
          </div>

          <ShellNav signedIn={signedIn} onNavigate={() => setMenuOpen(false)} />

          <div className="border-t border-asm-on-brand-line/40 px-5 py-3">
            <TeachToggle />
          </div>
          <div className="border-t border-asm-on-brand-line/40 px-5 py-3">
            <Link
              href="/ai-use"
              aria-current={pathname.startsWith('/ai-use') ? 'page' : undefined}
              className="inline-flex min-h-11 items-center text-[13px] font-medium text-asm-on-brand"
            >
              {c.shell.ask}
            </Link>
          </div>
          <div className="footer-controls flex flex-wrap items-center gap-1 border-t border-asm-on-brand-line/40 px-3 py-2 text-[13px]">
            <LanguageSwitcher />
            <ThemeToggle />
            {signedIn ? (
              <>
                <Link href="/profile" className="inline-flex min-h-11 items-center px-3 text-asm-on-brand">
                  {accountLabel ?? messages.nav.profile}
                </Link>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center px-3 text-asm-on-brand"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  {c.ui.signOut}
                </button>
              </>
            ) : (
              <Link href={accountHref} className="inline-flex min-h-11 items-center px-3 text-asm-on-brand">
                {c.home.signIn}
              </Link>
            )}
          </div>
          <div className="flex flex-col gap-3 px-5 pb-5 pt-2 text-[12px] text-asm-on-brand-3">
            <TurnerTownsendLogo height={22} />
            <span>
              {c.footer.demonstration}
              <br />
              {c.footer.representative}
            </span>
          </div>
        </aside>

        <main id="main-content" tabIndex={-1} className="min-w-0 bg-asm-canvas">
          <DemoBanner />
          {showStrip && contextEngagement ? (
            <ContextBar
              engagement={contextEngagement}
              engagements={contexts.length ? contexts : [contextEngagement]}
            />
          ) : null}
          <div className="mx-auto max-w-[1280px] px-4 pb-28 pt-8 md:px-10">
            <StageChrome pathname={pathname}>{children}</StageChrome>
          </div>
        </main>
      </div>
      {showTour ? <TourBar engagementId={contextEngagement?.id} /> : null}
    </DatumShellProvider>
  );
}

const SHELL_LINKS = [
  { href: '/', key: 'home', icon: Home },
  { href: '/squads', key: 'engagements', icon: Layers },
  { href: '/people', key: 'people', icon: Users },
  { href: '/roles', key: 'capability', icon: GraduationCap },
  { href: '/practice', key: 'playbook', icon: BookOpen },
  { href: '/portfolio', key: 'portfolio', icon: Compass },
  { href: '/practice/standards', key: 'standards', icon: ShieldCheck },
  { href: '/settings', key: 'settings', icon: Settings },
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
    return pathname.startsWith('/practice/standards');
  }
  if (href === '/squads') {
    return pathname.startsWith('/squads') || pathname.startsWith('/engagements') || /^\/assurance\/[^/]+/.test(pathname);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ShellNav({ signedIn, onNavigate }: { signedIn: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { locale } = useI18n();
  const c = getCopy(locale);
  const links = SHELL_LINKS.filter((item) => item.key !== 'settings' || signedIn);

  return (
    <nav aria-label={c.shell.navLabel} className="flex-1 py-2">
      <ul className="m-0 flex list-none gap-1 overflow-x-auto px-3 md:flex-col md:overflow-visible">
        {links.map((item) => {
          const active = shellActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="shrink-0 md:shrink">
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex min-h-11 items-center gap-3 whitespace-nowrap rounded-asm px-3 text-[15px] no-underline',
                  active
                    ? 'bg-asm-brand-hover font-semibold text-asm-on-brand'
                    : 'text-asm-on-brand-2 hover:bg-asm-brand-hover hover:text-asm-on-brand',
                ].join(' ')}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
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
  const level = maturityIndex(engagement.maturityLevel);
  const levelKey = (['practising', 'evidenced', 'assured', 'compounding'][(level ?? 1) - 1] ??
    'practising') as MaturityLevel;
  const maturityName = level ? c.maturityLevels[levelKey] : '';
  const phaseLabel = phaseDisplay(engagement.phase, lifecycleLabels(c), c.spine.missing);
  const standardsLabel = standardDisplayName(engagement.standardId, {
    wales: c.squads.standardWales,
    gds: c.squads.standardGds,
    missing: c.spine.missing,
  });

  return (
    <div className="flex flex-wrap items-baseline gap-6 border-b border-asm-line bg-asm-surface px-4 py-3.5 md:px-10">
      <Field label={c.context.engagement}>
        {engagements.length > 1 ? (
          <select
            value={engagement.id}
            aria-label={c.context.changeEngagement}
            className="rounded-asm border border-asm-line-strong bg-asm-surface px-2 py-1 text-[13px] font-semibold text-asm-ink"
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
        {level ? fillCopy(c.context.maturityValue, { level, name: maturityName }) : c.spine.missing}
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-[13px] font-semibold text-asm-ink">
      <span className="block text-[12px] font-normal text-asm-ink-3">
        {label}
      </span>
      {children}
    </div>
  );
}
