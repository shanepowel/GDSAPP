'use client';

import { useState } from 'react';
import { Layers, ListChecks, Bell } from 'lucide-react';
import { AssembleLockup, Button, ButtonLink } from '@/components/assemble-v2';

const STEPS = [
  { icon: Layers, title: 'Everything starts with an engagement', body: 'An engagement is a piece of work for a client. Assemble helps you staff it, set it up and keep it healthy, from bid to aftercare.' },
  { icon: ListChecks, title: 'Follow the lifecycle', body: 'Each engagement moves through Shape, Sprint Zero, Discovery, Alpha, Beta, Live and Operate. Assemble shows you what needs doing at each stage.' },
  { icon: Bell, title: 'We will tell you what needs attention', body: 'Your home page shows anything at risk, anything overdue and the next action on each engagement.' },
];

/** First-run welcome, shown once after first sign-in. Persist "seen" on the user record when wiring. */
export default function WelcomePage() {
  const [i, setI] = useState(0);
  const s = STEPS[i];
  const Icon = s.icon;
  const last = i === STEPS.length - 1;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-asm-brand p-6">
      <AssembleLockup />
      <section aria-labelledby="welcome-title" aria-live="polite" className="flex w-full max-w-lg flex-col gap-5 rounded-asm-lg bg-asm-surface p-8 shadow-asm-pop">
        <span className="flex size-14 items-center justify-center rounded-asm bg-asm-brand-wash text-asm-brand">
          <Icon size={28} aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-asm-ink-3">Step {i + 1} of {STEPS.length}</p>
        <h1 id="welcome-title" className="text-2xl font-bold text-asm-brand">{s.title}</h1>
        <p className="text-base leading-relaxed text-asm-ink-2">{s.body}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          {last ? (
            <>
              <ButtonLink href="/v2/engagements/new">Create your first engagement</ButtonLink>
              <ButtonLink href="/v2/home" variant="secondary">Explore the demo engagement</ButtonLink>
            </>
          ) : (
            <>
              <Button onClick={() => setI(i + 1)}>Next</Button>
              <ButtonLink href="/v2/home" variant="ghost">Skip</ButtonLink>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
