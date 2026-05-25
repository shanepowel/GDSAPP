'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, ClipboardCheck, Users } from 'lucide-react';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/app/LocaleProvider';

export function HomePage({ isSignedIn }: { isSignedIn: boolean }) {
  const { messages: m } = useI18n();

  const steps = [
    { title: m.home.step1Title, body: m.home.step1Body, icon: Users },
    { title: m.home.step2Title, body: m.home.step2Body, icon: ClipboardCheck },
    { title: m.home.step3Title, body: m.home.step3Body, icon: BarChart3 },
    { title: m.home.step4Title, body: m.home.step4Body, icon: ArrowRight },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 place-items-center rounded-lg"
              style={{ background: 'var(--tt-ink)' }}
            >
              <span className="font-display text-lg font-semibold text-brand">A</span>
            </div>
            <div>
              <div className="text-base font-semibold text-text">Assemble</div>
              <div className="text-[11px] text-text-muted">{m.app.tagline}</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isSignedIn ? (
              <Link href="/engagements">
                <Button>{m.home.ctaDashboard}</Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="secondary">{m.home.ctaSignIn}</Button>
                </Link>
                <Link href="/sign-in?tab=register">
                  <Button>{m.home.ctaRegister}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-container px-6 py-16 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-hover">
            GDS · Wales digital standards · DDaT
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-text md:text-5xl">
            {m.home.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-text-muted">{m.home.heroSubtitle}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            {isSignedIn ? (
              <Link href="/engagements">
                <Button className="gap-2">
                  {m.home.ctaDashboard}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in?tab=register">
                  <Button className="gap-2">
                    {m.home.ctaRegister}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="secondary">{m.home.ctaSignIn}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-container px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-text">{m.home.whatTitle}</h2>
        <p className="mt-4 max-w-3xl text-text-muted leading-relaxed">{m.home.whatBody}</p>
      </section>

      <section className="border-y border-border bg-surface-alt">
        <div className="mx-auto max-w-container px-6 py-16">
          <h2 className="font-display text-2xl font-semibold text-text">{m.home.howTitle}</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2">
            {steps.map(({ title, body, icon: Icon }) => (
              <li
                key={title}
                className="rounded-lg border border-border bg-surface p-6 shadow-sm"
              >
                <Icon className="h-8 w-8 text-brand" aria-hidden />
                <h3 className="mt-4 font-semibold text-text">{title}</h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-border bg-surface-alt">
        <div className="mx-auto max-w-container px-6 py-16">
          <h2 className="font-display text-2xl font-semibold text-text">Platform features</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Readiness & composition analysis against GDS or Wales points',
              'Agile rigour rubric (7 dimensions) with history and diffs',
              'Evidence register linked to standard points',
              'Call-off criteria, PDF import, bid outlook & draft scaffolds',
              'Human assurance judgements and executive reports',
              'Portfolio rollup by supplier and lot',
              'Benchmarking outcomes and framework drift detection',
              'Shareable read-only reports and branded PDF export',
              'Bilingual UI (English / Welsh) and dark theme',
            ].map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-container px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-text">{m.home.whoTitle}</h2>
        <p className="mt-4 max-w-3xl text-text-muted leading-relaxed">{m.home.whoBody}</p>
        {!isSignedIn && (
          <div className="mt-10 rounded-xl border border-brand/30 bg-brand-tint p-8">
            <p className="font-medium text-text">Try the demo after signing in</p>
            <p className="mt-2 text-sm text-text-muted">
              <code className="rounded bg-surface px-1.5 py-0.5">admin@demo.local</code> /{' '}
              <code className="rounded bg-surface px-1.5 py-0.5">demo-password</code> (seeded
              environments only)
            </p>
            <Link href="/sign-in" className="mt-4 inline-block">
              <Button variant="secondary">{m.home.ctaSignIn}</Button>
            </Link>
          </div>
        )}
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-text-muted">
        {m.app.advisoryFooter}
      </footer>
    </div>
  );
}
