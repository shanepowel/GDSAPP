'use client';

import { useState } from 'react';
import type { EngagementStatus } from '@/lib/assemble-v2/types';
import { cn } from '@/lib/assemble-v2/cn';
import { Button } from './Button';
import { Field, Input, Textarea } from './Field';
import { StatusPill } from './StatusPill';

/**
 * Squad Lead sets the engagement status. Assemble suggests one from the measures; the person decides.
 * At risk opens a recovery plan; Off track prompts a risk lock within 48 hours.
 */
export function StatusControl({ initial, suggested }: { initial: EngagementStatus; suggested: EngagementStatus }) {
  const [status, setStatus] = useState<EngagementStatus>(initial);
  const opts: EngagementStatus[] = ['on-track', 'at-risk', 'off-track'];
  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold text-asm-ink">Status this month</legend>
        <p className="text-[13px] text-asm-ink-3">
          Suggested from the measures: <StatusPill status={suggested} size="sm" />
        </p>
        <div className="flex flex-wrap gap-2">
          {opts.map((o) => (
            <label key={o} className={cn('flex cursor-pointer items-center gap-2 rounded-asm border px-3 py-2', status === o ? 'border-asm-brand bg-asm-brand-wash' : 'border-asm-line-strong')}>
              <input type="radio" name="status" checked={status === o} onChange={() => setStatus(o)} className="accent-asm-brand" />
              <StatusPill status={o} size="sm" />
            </label>
          ))}
        </div>
        <Field id="why" label="Why?">
          <Input id="why" defaultValue="Team health fell to 3.4 after a bid support exception with no end date." />
        </Field>
      </fieldset>
      {status === 'at-risk' ? (
        <div className="flex flex-col gap-4 rounded-asm-lg border border-asm-warn-line bg-asm-warn-wash-2 p-5">
          <div>
            <h3 className="text-base font-bold text-asm-warn-ink">Recovery plan</h3>
            <p className="text-sm text-asm-ink-2">Add a recovery plan within a week. The Delivery Lead reviews it.</p>
          </div>
          <Field id="off" label="What is off track"><Textarea id="off" defaultValue="Team health 3.4 against a target of 4.0. ‘Our workload is sustainable’ averaged 2.6." /></Field>
          <Field id="cause" label="Cause"><Textarea id="cause" defaultValue="Priya Shah is supporting a bid under a Keel exception with no end date." /></Field>
          <Field id="actions" label="Actions, each with an owner and a date"><Textarea id="actions" defaultValue={'Set the exception end date to 15 Nov. Shane Powell, 6 Nov.\nBackfill two days a week from Marcus Bell. Resourcing, 7 Nov.'} /></Field>
          <Field id="green" label="Back on track by"><Input id="green" defaultValue="30 Nov" /></Field>
          <div className="flex flex-wrap gap-2"><Button>Save recovery plan</Button><Button variant="secondary">Draft with Assemble</Button></div>
        </div>
      ) : null}
      {status === 'off-track' ? (
        <div role="alert" className="flex flex-col gap-3 rounded-asm-lg border border-asm-risk bg-asm-risk-wash p-5">
          <p className="font-semibold text-asm-risk-ink">Book a risk lock within 48 hours and tell the steering committee.</p>
          <div className="flex flex-wrap gap-2"><Button>Book risk lock</Button><Button variant="secondary">Notify Delivery Lead</Button></div>
        </div>
      ) : null}
    </div>
  );
}
