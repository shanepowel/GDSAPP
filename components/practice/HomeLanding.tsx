'use client';

import { useSession } from 'next-auth/react';
import { AttentionHome } from '@/components/home/AttentionHome';
import { ButtonLink } from '@/components/library/Button';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export function HomeLanding() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const { status } = useSession();

  if (status === 'loading') {
    return <p className="text-asm-ink-3">{copy.ui.loading}</p>;
  }
  if (status === 'authenticated') {
    return <AttentionHome />;
  }
  return <MarketingHome />;
}

function MarketingHome() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const c = copy.home;

  return (
    <div className="asm-root flex flex-col gap-12">
      <section className="relative overflow-hidden rounded-asm-lg bg-asm-brand px-8 py-14 md:px-14 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-asm-brand-mid opacity-30" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-40 size-[300px] rounded-full bg-asm-brand-deep opacity-60" />
        <div className="relative flex max-w-3xl flex-col gap-5">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-asm-brand-tint">{c.eyebrow}</span>
          <h1 className="m-0 text-[36px] font-bold leading-[1.1] text-asm-on-brand md:text-[48px]">{c.headline}</h1>
          <p className="m-0 max-w-2xl text-lg text-asm-on-brand-2">{c.sub}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <ButtonLink href="/demo" variant="inverse" size="lg">
              {c.primaryCta}
            </ButtonLink>
            <ButtonLink href="/sign-in" variant="inverse-outline" size="lg">
              {c.secondaryCta}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {c.claims.map((claim) => (
          <div key={claim.title} className="flex flex-col gap-2 rounded-asm-lg border border-asm-line bg-asm-surface p-6">
            <span aria-hidden="true" className="h-1 w-10 rounded-full bg-asm-brand" />
            <h2 className="m-0 mt-2 text-lg font-bold text-asm-brand">{claim.title}</h2>
            <p className="m-0 text-[15px] text-asm-ink-2">{claim.body}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="how-title" className="flex flex-col gap-6">
        <h2 id="how-title" className="m-0 text-[28px] font-bold text-asm-brand">
          {c.how.title}
        </h2>
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 xl:grid-cols-4">
          {c.how.steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3 rounded-asm-lg border border-asm-line bg-asm-surface p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-asm-brand-wash text-sm font-bold text-asm-brand tabular-nums">
                {index + 1}
              </span>
              <h3 className="m-0 text-base font-bold text-asm-ink">{step.title}</h3>
              <p className="m-0 text-sm text-asm-ink-2">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[c.standards, c.builtOn].map((block) => (
          <div key={block.title} className="flex flex-col gap-2 rounded-asm-lg bg-asm-brand-wash p-7">
            <h2 className="m-0 text-xl font-bold text-asm-brand">{block.title}</h2>
            <p className="m-0 text-[15px] text-asm-ink-2">{block.body}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-asm-lg border border-asm-line bg-asm-surface px-8 py-7">
        <h2 className="m-0 text-2xl font-bold text-asm-brand">{c.close.title}</h2>
        <ButtonLink href="/demo" size="lg">
          {c.close.cta}
        </ButtonLink>
      </section>

      <footer>
        <p className="m-0 text-[13px] text-asm-ink-3">{copy.footer.disclaimer}</p>
      </footer>
    </div>
  );
}
