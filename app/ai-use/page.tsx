import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';

export const metadata: Metadata = {
  title: 'AI use — Assemble',
  description: 'How Assemble uses AI in digital service assurance.',
};

export default function AiUsePage() {
  return (
    <div className="min-h-screen bg-stock-1 text-ink-0">
      <header className="border-b border-rule bg-stock-0 px-4 py-4 md:px-8">
        <BrandMark href="/" variant="light" />
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em]">How Assemble uses AI</h1>
        <p className="mt-3 text-[15px] leading-[1.55] text-ink-1">
          AI may propose. Only a named human may judge. This page summarises the governance boundary
          published in the product specification.
        </p>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">What AI may do</h2>
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-[1.55] text-ink-1">
            <li>Draft a judgement rationale for a human to edit and confirm</li>
            <li>Suggest capability links and org-design patches into scenarios</li>
            <li>Summarise evidence metadata (kind, dates) for human acceptance</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">What AI may never do</h2>
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-[1.55] text-ink-1">
            <li>Set or change a verdict without a confirmed human</li>
            <li>Write to the live org graph without promote</li>
            <li>Create evidence that counts toward the preparedness index</li>
            <li>Produce Welsh content for export without human review</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">Provenance</h2>
          <p className="text-[15px] leading-[1.55] text-ink-1">
            Every judgement and evidence row carries a provenance chip on screen and in the panel PDF.
            AI-drafted rationales confirmed unchanged remain labelled{' '}
            <span className="font-data text-[12px]">AI drafted · confirmed by [name]</span>.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">Data residency</h2>
          <p className="text-[15px] leading-[1.55] text-ink-1">
            Application data is intended for UK/EU regions (Neon PostgreSQL in production). AI
            providers must be configured for UK/EU processing; prompts redact personal data where
            practical. Engagement owners can disable AI assists per engagement when{' '}
            <span className="font-data">aiEnabled</span> is off.
          </p>
        </section>

        <p className="mt-10 text-[13px] text-ink-2">
          <Link href="/accessibility" className="text-signal-ink underline-offset-2 hover:underline">
            Accessibility
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
