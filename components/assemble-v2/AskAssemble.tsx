'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/assemble-v2/cn';
import { Button } from './Button';
import { Field, Textarea } from './Field';

const SUGGESTED = [
  'Draft the squad charter',
  "Draft this month's report",
  'Draft the steering committee pack',
  'Is this a change or a defect?',
  'Suggest people for the Technical Lead role',
  'What is blocking Sprint Zero?',
  'Which standards apply at this stage?',
];

/**
 * Ask Assemble: the co-pilot drawer.
 * UI only. Wire `onSubmit` to the existing AI service (see lib/org-design/ai.ts and
 * docs/redesign/WIRING.md). Outputs are always labelled "Draft" until a person saves them.
 */
export function AskAssemble({ variant = 'sidebar' }: { variant?: 'sidebar' | 'inline' }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2.5 rounded-asm px-3 py-3 text-[15px] font-semibold',
          variant === 'sidebar' ? 'bg-asm-brand-mid text-asm-on-brand hover:bg-asm-brand-hover' : 'border border-asm-line-strong bg-asm-surface text-asm-brand',
        )}
      >
        <Sparkles size={18} strokeWidth={1.8} aria-hidden="true" />
        Ask Assemble
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-asm-black/30" role="presentation" onClick={() => setOpen(false)}>
          <aside role="dialog" aria-modal="true" aria-labelledby="ask-title" className="asm-root flex h-full w-full max-w-md flex-col gap-5 overflow-y-auto bg-asm-surface p-6 shadow-asm-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 id="ask-title" className="flex items-center gap-2 text-lg font-bold text-asm-brand">
                <Sparkles size={20} aria-hidden="true" /> Ask Assemble
              </h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close Ask Assemble" className="rounded-asm p-2 text-asm-ink-2 hover:bg-asm-sunk">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button key={s} type="button" onClick={() => setPrompt(s)} className="rounded-full border border-asm-line-strong px-3 py-2 text-[13px] font-semibold text-asm-ink-2 hover:border-asm-brand hover:text-asm-brand">
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (prompt.trim()) setSent(prompt.trim());
              }}
            >
              <Field id="ask-input" label="Your question or request">
                <Textarea id="ask-input" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask about this engagement, or ask Assemble to draft something" />
              </Field>
              <Button type="submit">Ask</Button>
            </form>
            {sent ? (
              <div className="flex flex-col gap-2 rounded-asm border border-asm-line bg-asm-canvas p-4">
                <span className="w-fit rounded-full bg-asm-brand-wash px-2 py-0.5 text-xs font-semibold text-asm-brand">Draft</span>
                <p className="text-sm text-asm-ink-2">Assemble will draft a response to “{sent}” here, using this engagement&apos;s data and the Playbook templates.</p>
              </div>
            ) : null}
            <p className="mt-auto text-xs text-asm-ink-3">Assemble drafts; you decide. Check anything before you share it.</p>
          </aside>
        </div>
      ) : null}
    </>
  );
}
