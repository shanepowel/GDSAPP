import type { Metadata } from 'next';
import Link from 'next/link';
import { DatumAppShell } from '@/components/shell/AppShell';

export const metadata: Metadata = {
  title: 'How we use AI',
  description: 'How Assemble uses AI in digital service assurance.',
};

export default function AiUsePage() {
  return (
    <DatumAppShell showTour={false}>
      <main className="mx-auto max-w-2xl">
        <h1 className="text-[28px] font-semibold text-asm-brand">How we use AI</h1>
        <p className="mt-3 text-[15px] leading-[1.55] text-asm-ink-2">
          AI may propose. Only a named person may judge. This page describes that boundary in plain English.
        </p>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">What AI may do</h2>
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-[1.55] text-asm-ink-2">
            <li>Draft a judgement rationale for a person to edit and confirm</li>
            <li>Suggest capability links and organisation changes for someone to accept</li>
            <li>Summarise evidence for a person to accept</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">What AI may never do</h2>
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-[1.55] text-asm-ink-2">
            <li>Set or change a verdict without a confirmed person</li>
            <li>Change the live organisation without someone promoting the change</li>
            <li>Create evidence that counts toward the preparedness index</li>
            <li>Produce Welsh content for export without a person reviewing it</li>
          </ul>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">Provenance</h2>
          <p className="text-[15px] leading-[1.55] text-asm-ink-2">
            Every judgement and piece of evidence shows who confirmed it. A draft that a person accepts unchanged stays labelled as drafted by AI and confirmed by that person.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-[17px] font-semibold">Where data is kept</h2>
          <p className="text-[15px] leading-[1.55] text-asm-ink-2">
            Application data is kept in the UK or the EU. AI providers must process prompts in the UK or the EU, and prompts leave out personal data where that is practical. An engagement lead can turn AI assists off for an engagement.
          </p>
        </section>

        <p className="mt-10 text-[13px] text-asm-ink-3">
          <Link href="/accessibility" className="underline-offset-2 hover:underline">
            Accessibility
          </Link>
          {' · '}
          <Link href="/performance" className="underline-offset-2 hover:underline">
            Performance
          </Link>
        </p>
      </main>
    </DatumAppShell>
  );
}
