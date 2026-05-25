'use client';

import Link from 'next/link';
import { Globe } from 'lucide-react';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import { useI18n } from '@/components/app/LocaleProvider';

export function AppShell({
  title,
  children,
  actions,
  standardId,
  orgLabel,
  hideTitle,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  standardId?: 'wales' | 'gds' | string;
  orgLabel?: string;
  hideTitle?: boolean;
}) {
  const { messages: m } = useI18n();
  const standardBadge =
    standardId === 'wales'
      ? 'Wales standard'
      : standardId === 'gds'
        ? 'GDS standard'
        : null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/engagements" className="flex items-center gap-3">
              <div
                className="grid h-9 w-9 place-items-center rounded-lg"
                style={{ background: 'var(--tt-ink)' }}
              >
                <span className="font-display text-base font-semibold text-brand">A</span>
              </div>
              <div>
                <div className="text-[15px] font-semibold leading-none text-text">Assemble</div>
                <div className="mt-0.5 text-[11px] text-text-muted">{m.app.tagline}</div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {standardBadge && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1 text-[12px] font-medium text-brand-hover">
                <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {standardBadge}
              </span>
            )}
            <LanguageSwitcher />
            {actions}
            <div
              className="h-8 w-8 rounded-full bg-accent"
              aria-hidden
              title="Account"
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-container px-6 py-8">
        {!hideTitle && (
          <>
            {orgLabel && (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-hover">
                {orgLabel}
              </p>
            )}
            <h1 className="font-display text-2xl font-semibold text-text md:text-[34px] md:leading-tight">
              {title}
            </h1>
          </>
        )}
        {children}
      </main>
      <footer className="mx-auto max-w-container px-6 py-8 text-xs text-text-muted">
        {m.app.advisoryFooter}
      </footer>
    </div>
  );
}
