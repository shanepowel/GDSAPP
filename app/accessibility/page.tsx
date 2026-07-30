import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';

export const metadata: Metadata = {
  title: 'Accessibility — Assemble',
  description: 'Accessibility statement for Assemble by Turner & Townsend.',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-stock-1 text-ink-0">
      <header className="border-b border-rule bg-stock-0 px-4 py-4 md:px-8">
        <BrandMark href="/" variant="light" />
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Accessibility statement</h1>
        <p className="mt-3 text-[15px] leading-[1.55] text-ink-1">
          This statement applies to the Assemble web application operated by Turner &amp; Townsend.
          We aim to meet WCAG 2.2 AA.
        </p>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">Scope</h2>
          <p className="text-[15px] leading-[1.55] text-ink-1">
            Authenticated engagement workflows (overview, assess, organise, evidence, assure, report)
            and public pages including sign-in, this statement, AI use, and performance.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">Known issues</h2>
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-[1.55] text-ink-1">
            <li>
              Sign-in marketing layout may still flag colour-contrast and landmark findings in automated
              axe scans; remediation is tracked for continuous improvement.
            </li>
            <li>
              Complex org-design canvas interactions rely on a parallel table view for keyboard and
              screen-reader access.
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">How we test</h2>
          <p className="text-[15px] leading-[1.55] text-ink-1">
            Automated axe checks run in Playwright smoke tests. Manual keyboard review covers primary
            engagement flows. An independent WCAG 2.2 AA audit is the remaining compliance gate for
            production procurement.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">Contact</h2>
          <p className="text-[15px] leading-[1.55] text-ink-1">
            Report accessibility issues to your Turner &amp; Townsend engagement lead, or email{' '}
            <a className="text-signal-ink underline" href="mailto:accessibility@assemble.local">
              accessibility@assemble.local
            </a>
            .
          </p>
        </section>

        <p className="mt-10 text-[13px] text-ink-2">
          <Link href="/" className="text-signal-ink underline-offset-2 hover:underline">
            Home
          </Link>
          {' · '}
          <Link href="/ai-use" className="text-signal-ink underline-offset-2 hover:underline">
            AI use
          </Link>
          {' · '}
          <Link href="/performance" className="text-signal-ink underline-offset-2 hover:underline">
            Performance
          </Link>
        </p>
      </main>
    </div>
  );
}
