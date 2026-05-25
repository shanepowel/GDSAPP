'use client';

import { BRAND } from '@/lib/brand';
import Link from 'next/link';
import { ArrowRight, BarChart3, ClipboardCheck, Eye, Scale, Users } from 'lucide-react';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import { BrandMark } from '@/components/brand/BrandMark';
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

  const pillars = [
    { icon: Eye, title: m.home.pillarWorkingTitle, body: m.home.pillarWorkingBody },
    { icon: Scale, title: m.home.pillarAssessTitle, body: m.home.pillarAssessBody },
    { icon: ArrowRight, title: m.home.pillarHandoverTitle, body: m.home.pillarHandoverBody },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header style={{ background: 'var(--tt-navy)', color: 'var(--tt-white)' }}>
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-4">
          <BrandMark href="/" variant="dark" />
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

        <div className="mx-auto max-w-container px-6 pb-14 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {m.home.heroEyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight md:text-[38px]">
            {m.home.heroTitle}
            <br />
            <span style={{ color: 'var(--tt-blue-hero)' }}>{m.home.heroTitleAccent}</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">{m.home.heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            {isSignedIn ? (
              <Link href="/engagements">
                <Button className="gap-2">
                  {m.home.ctaDashboard}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in?callbackUrl=%2Fengagements%2Fnrw-demo">
                  <Button className="gap-2">
                    {m.home.ctaTryDemo}
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
      </header>

      <section className="mx-auto max-w-container px-6 py-16">
        <h2 className="font-display text-2xl font-bold text-text">{m.home.whatTitle}</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-text-muted">{m.home.whatBody}</p>
      </section>

      <section className="border-y border-border bg-surface-alt">
        <div className="mx-auto max-w-container px-6 py-16">
          <h2 className="font-display text-2xl font-bold text-text">{m.home.howTitle}</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2">
            {steps.map(({ title, body, icon: Icon }) => (
              <li
                key={title}
                className="rounded-lg border border-border bg-surface p-6 shadow-sm"
              >
                <Icon className="h-8 w-8 text-brand" aria-hidden />
                <h3 className="mt-4 font-semibold text-text">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-container px-6 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <div
                className="grid h-10 w-10 place-items-center rounded-lg"
                style={{ background: 'var(--tt-blue-050)' }}
              >
                <Icon className="h-5 w-5 text-brand" aria-hidden />
              </div>
              <h3 className="mt-3 font-display text-[15px] font-bold text-text">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {!isSignedIn && (
        <section className="mx-auto max-w-container px-6 pb-16">
          <div className="rounded-xl border border-brand/30 bg-brand-tint p-8">
            <h2 className="font-display text-lg font-semibold text-text">{m.home.demoTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{m.home.demoBody}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/sign-in?callbackUrl=%2Fengagements%2Fnrw-demo">
                <Button className="gap-2">
                  {m.home.ctaTryDemo}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="secondary">{m.home.ctaSignIn}</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-text-muted">
        {m.app.advisoryFooter}
      </footer>
    </div>
  );
}
