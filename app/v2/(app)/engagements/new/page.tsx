'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, Field, Input, PageHeader, Select, Stepper, Textarea } from '@/components/assemble-v2';
import { cn } from '@/lib/assemble-v2/cn';
import type { SquadShape } from '@/lib/assemble-v2/types';

const STEPS = ['About', 'Commercials', 'Squad', 'Governance'];

const SHAPES: { key: SquadShape; title: string; body: string; roles: string[] }[] = [
  { key: 'software-product', title: 'Software product squad', body: 'Web apps, portals and integrations.', roles: ['Squad Lead', 'Product Lead', 'Technical Lead', 'Engineer', 'Engineer', 'Quality specialist'] },
  { key: 'data-platform', title: 'Data platform squad', body: 'Lakehouses, pipelines, Fabric or Databricks.', roles: ['Squad Lead', 'Product Lead', 'Technical Lead (data architect)', 'Data engineer', 'Data engineer', 'Power BI developer'] },
  { key: 'reporting', title: 'Reporting squad', body: 'Power BI and dashboards on an existing platform.', roles: ['Squad Lead', 'Product Lead or analyst', 'Power BI developer', 'Power BI developer'] },
  { key: 'automation', title: 'Automation squad', body: 'Power Platform, workflow and AI automation.', roles: ['Squad Lead', 'Product Lead', 'Technical Lead', 'Developer', 'Developer'] },
  { key: 'discovery', title: 'Discovery squad', body: 'A short discovery or alpha before a larger build.', roles: ['Product Lead', 'User researcher', 'Technical Lead', 'Analyst'] },
];

/**
 * New engagement wizard. Client component because it holds step state.
 * Wire "Create engagement" to trpc.engagement.create and seed the Sprint Zero checklist,
 * charter and ceremonies from the chosen squad shape (docs/redesign/WIRING.md).
 */
export default function NewEngagementPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [model, setModel] = useState('fixed-price');
  const [scopeClear, setScopeClear] = useState('yes');
  const [shape, setShape] = useState<SquadShape | null>('data-platform');
  const [poDays, setPoDays] = useState(2);
  const [keelBlocked, setKeelBlocked] = useState(false);
  const chosen = SHAPES.find((s) => s.key === shape);

  return (
    <>
      <PageHeader title="New engagement" subtitle="Four short steps. You can change any of this later." />
      <Stepper steps={STEPS} current={step} />
      <Card className="max-w-3xl">
        <CardBody className="flex flex-col gap-6 py-7">
          {step === 0 ? (
            <>
              <h2 className="text-xl font-bold text-asm-brand">What is this engagement?</h2>
              <Field id="name" label="Engagement name" hint="For example, Finance data platform">
                <Input id="name" aria-describedby="name-hint" />
              </Field>
              <Field id="client" label="Client">
                <Input id="client" />
              </Field>
              <div className="flex flex-wrap gap-4">
                <Field id="sector" label="Sector" className="flex-1 basis-56">
                  <Select id="sector">
                    <option>Public sector</option>
                    <option>Infrastructure</option>
                    <option>Real estate</option>
                    <option>Energy and utilities</option>
                    <option>Other</option>
                  </Select>
                </Field>
                <Field id="start" label="Start date" className="flex-1 basis-40">
                  <Input id="start" type="date" />
                </Field>
                <Field id="end" label="Expected end date" className="flex-1 basis-40">
                  <Input id="end" type="date" />
                </Field>
              </div>
              <Field id="outcomes" label="Outcomes" hint="Two to four outcomes, each with a measure. For example, ‘Finance managers see actuals within one day of month end.’">
                <Textarea id="outcomes" aria-describedby="outcomes-hint" />
              </Field>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <h2 className="text-xl font-bold text-asm-brand">How is it contracted?</h2>
              <Field id="model" label="Commercial model">
                <Select id="model" value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="fixed-price">Fixed price</option>
                  <option value="time-and-materials">Time and materials</option>
                  <option value="outcome-based">Outcome-based</option>
                  <option value="retained">Retained</option>
                </Select>
              </Field>
              {model === 'fixed-price' ? (
                <p className="rounded-asm bg-asm-brand-wash px-4 py-3 text-sm text-asm-brand">Fixed-price engagements need a steering committee and an agreed change route. We will set both up in step 4.</p>
              ) : null}
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-semibold text-asm-ink">Is scope clear enough to fix the price?</legend>
                {[
                  ['yes', 'Yes'],
                  ['no', 'No, price a discovery first'],
                ].map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2.5 text-[15px]">
                    <input type="radio" name="scope" value={v} checked={scopeClear === v} onChange={() => setScopeClear(v)} className="size-[18px] accent-asm-brand" />
                    {l}
                  </label>
                ))}
              </fieldset>
              {scopeClear === 'no' ? <p className="rounded-asm bg-asm-warn-wash px-4 py-3 text-sm text-asm-warn-ink">Consider pricing a discovery first and fixing the delivery price afterwards.</p> : null}
              <Field id="milestones" label="Payment milestones" hint="One per line: name, date, and what proves it is met.">
                <Textarea id="milestones" aria-describedby="milestones-hint" />
              </Field>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-asm-brand">Choose a squad shape</h2>
                <p className="text-sm text-asm-ink-3">Pick the closest shape. You can adjust roles after.</p>
              </div>
              <fieldset className="grid gap-3 sm:grid-cols-2">
                <legend className="sr-only">Squad shape</legend>
                {SHAPES.map((s) => (
                  <label key={s.key} className={cn('flex cursor-pointer flex-col gap-1 rounded-asm-lg border p-4', shape === s.key ? 'border-asm-brand bg-asm-brand-wash' : 'border-asm-line hover:border-asm-brand-soft')}>
                    <span className="flex items-center gap-2.5">
                      <input type="radio" name="shape" checked={shape === s.key} onChange={() => setShape(s.key)} className="size-[18px] accent-asm-brand" />
                      <span className="font-bold text-asm-brand">{s.title}</span>
                    </span>
                    <span className="pl-7 text-sm text-asm-ink-2">{s.body}</span>
                  </label>
                ))}
              </fieldset>
              {chosen ? (
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-asm-ink-2">Roles to fill</h3>
                  <ul className="flex flex-col divide-y divide-asm-line-soft rounded-asm border border-asm-line">
                    {chosen.roles.map((r, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-[15px]">
                        {r}
                        <button type="button" onClick={() => setKeelBlocked(i === 2)} className="text-sm font-semibold text-asm-brand underline-offset-4 hover:underline">
                          Find people<span className="sr-only"> for {r}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {keelBlocked ? (
                <div role="alert" className="flex flex-col gap-2 rounded-asm border border-asm-warn-line bg-asm-warn-wash-2 p-4">
                  <strong className="text-asm-warn-ink">This breaks a Keel rule</strong>
                  <p className="text-sm text-asm-ink-2">This assignment would put Daniel Okafor on 2 engagements. The Keel allows one. Choose someone else or request an exception. Exceptions need approval from the Head of Delivery and an end date.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setKeelBlocked(false)}>Choose someone else</Button>
                    <Button size="sm" onClick={() => setKeelBlocked(false)}>Request exception</Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h2 className="text-xl font-bold text-asm-brand">Set up governance</h2>
              <div className="flex flex-wrap gap-4">
                <Field id="chair" label="Steering committee chair (client)" className="flex-1 basis-64">
                  <Input id="chair" />
                </Field>
                <Field id="freq" label="Frequency" className="flex-1 basis-40">
                  <Select id="freq">
                    <option>Monthly</option>
                    <option>Fortnightly</option>
                  </Select>
                </Field>
              </div>
              <div className="flex flex-wrap gap-4">
                <Field id="po" label="Client Product Owner" className="flex-1 basis-64">
                  <Input id="po" />
                </Field>
                <Field id="podays" label="Product Owner availability (days a week)" className="flex-1 basis-40">
                  <Input id="podays" type="number" min={0} max={5} step={0.5} value={poDays} onChange={(e) => setPoDays(Number(e.target.value))} />
                </Field>
              </div>
              {poDays < 2 ? <p role="status" className="rounded-asm bg-asm-warn-wash px-4 py-3 text-sm text-asm-warn-ink">Less than two days a week is a delivery risk. We will add it to the RAID log so you can raise it at the first steering committee.</p> : null}
              <div className="flex flex-wrap gap-4">
                <Field id="am" label="Account Manager" className="flex-1 basis-64">
                  <Input id="am" />
                </Field>
                <Field id="threshold" label="Change approval threshold (£)" className="flex-1 basis-40">
                  <Input id="threshold" type="number" min={0} step={1000} />
                </Field>
              </div>
            </>
          ) : null}

          <div className="flex flex-wrap justify-between gap-3 border-t border-asm-line pt-5">
            <Button variant="secondary" onClick={() => (step === 0 ? router.push('/v2/engagements') : setStep(step - 1))}>
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
              <Button onClick={() => router.push('/v2/engagements/finance-data-platform')}>Create engagement</Button>
            )}
          </div>
        </CardBody>
      </Card>
    </>
  );
}
