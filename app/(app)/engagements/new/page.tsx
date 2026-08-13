'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/app/LocaleProvider';
import {
  ENGAGEMENT_MODES,
  ENGAGEMENT_PHASES,
} from '@/lib/standards/catalog';
import { trpc } from '@/lib/trpc/client';

const STEPS = ['Client and service', 'Standard and phase', 'Team', 'Mode'] as const;

export default function NewEngagementWizardPage() {
  const { messages: m } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [clientOrg, setClientOrg] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [sector, setSector] = useState<'digital-service' | 'capital-programme' | 'hybrid'>(
    'digital-service',
  );
  const [serviceDescription, setServiceDescription] = useState('');
  const [standardId, setStandardId] = useState<'gds' | 'wales'>('gds');
  const [phase, setPhase] = useState<(typeof ENGAGEMENT_PHASES)[number]>('discovery');
  const [mode, setMode] = useState<(typeof ENGAGEMENT_MODES)[number]>('bid');
  const [templateId, setTemplateId] = useState<string>('gds-discovery-team');

  const templates = trpc.orgDesign.listTemplates.useQuery();
  const create = trpc.engagement.create.useMutation();
  const applyTemplate = trpc.orgDesign.applyTemplate.useMutation();
  const bind = trpc.orgDesign.bindEngagementStructure.useMutation();

  async function finish() {
    const engagement = await create.mutateAsync({
      name: serviceName.trim() || 'Untitled engagement',
      standardId,
      clientOrg: clientOrg.trim() || undefined,
      sector,
      serviceName: serviceName.trim() || undefined,
      serviceDescription: serviceDescription.trim() || undefined,
      phase,
      mode,
    });

    if (templateId) {
      try {
        await applyTemplate.mutateAsync({ templateId });
        await bind.mutateAsync({ engagementId: engagement.id, designBinding: 'live' });
      } catch {
        // Template apply is best-effort; engagement still created.
      }
    }

    const landing =
      mode === 'mobilise'
        ? `/engagements/${engagement.id}/organise/people`
        : mode === 'assure'
          ? `/squads/${engagement.id}`
          : `/engagements/${engagement.id}/organise`;
    router.push(landing);
  }

  return (
    <AppShell title={m.engagements.new}>
      <ol className="mb-8 flex flex-wrap gap-4" aria-label="Creation steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className="font-data text-[12px] uppercase tracking-[0.04em]"
            style={{ color: i === step ? 'var(--signal-ink)' : 'var(--ink-2)' }}
          >
            <span className="mr-2 tabular-nums">{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset className="max-w-lg space-y-4">
          <legend className="mb-2 text-[17px] font-semibold text-ink-0">{STEPS[0]}</legend>
          <label className="block text-[13px] font-medium text-ink-1">
            Client organisation
            <input
              className="mt-1 block w-full rounded-[2px] border border-rule px-3 py-2 text-sm"
              value={clientOrg}
              onChange={(e) => setClientOrg(e.target.value)}
              required
            />
          </label>
          <label className="block text-[13px] font-medium text-ink-1">
            Service name
            <input
              className="mt-1 block w-full rounded-[2px] border border-rule px-3 py-2 text-sm"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
            />
          </label>
          <label className="block text-[13px] font-medium text-ink-1">
            Sector
            <select
              className="mt-1 block w-full rounded-[2px] border border-rule px-3 py-2 text-sm"
              value={sector}
              onChange={(e) => setSector(e.target.value as typeof sector)}
            >
              <option value="digital-service">Digital service</option>
              <option value="capital-programme">Capital programme</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
          <label className="block text-[13px] font-medium text-ink-1">
            Service description
            <textarea
              className="mt-1 block w-full rounded-[2px] border border-rule px-3 py-2 text-sm"
              rows={3}
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
            />
          </label>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="max-w-lg space-y-4">
          <legend className="mb-2 text-[17px] font-semibold text-ink-0">{STEPS[1]}</legend>
          <label className="block text-[13px] font-medium text-ink-1">
            Standard
            <select
              className="mt-1 block w-full rounded-[2px] border border-rule px-3 py-2 text-sm"
              value={standardId}
              onChange={(e) => setStandardId(e.target.value as 'gds' | 'wales')}
            >
              <option value="gds">GDS Service Standard</option>
              <option value="wales">Digital Service Standard for Wales</option>
            </select>
          </label>
          <label className="block text-[13px] font-medium text-ink-1">
            Phase
            <select
              className="mt-1 block w-full rounded-[2px] border border-rule px-3 py-2 text-sm"
              value={phase}
              onChange={(e) => setPhase(e.target.value as typeof phase)}
            >
              {ENGAGEMENT_PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="max-w-lg space-y-4">
          <legend className="mb-2 text-[17px] font-semibold text-ink-0">{STEPS[2]}</legend>
          <p className="text-[15px] text-ink-1">
            Start from a template. CSV import and Entra directory pull land in a later iteration.
          </p>
          <label className="block text-[13px] font-medium text-ink-1">
            Template
            <select
              className="mt-1 block w-full rounded-[2px] border border-rule px-3 py-2 text-sm"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <option value="">Skip — add team later</option>
              {(templates.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.size})
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="max-w-lg space-y-4">
          <legend className="mb-2 text-[17px] font-semibold text-ink-0">{STEPS[3]}</legend>
          <label className="block text-[13px] font-medium text-ink-1">
            Mode
            <select
              className="mt-1 block w-full rounded-[2px] border border-rule px-3 py-2 text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
            >
              {ENGAGEMENT_MODES.map((modeOption) => (
                <option key={modeOption} value={modeOption}>
                  {modeOption}
                </option>
              ))}
            </select>
          </label>
          <p className="text-[15px] text-ink-1">
            Mode changes defaults, never capability. Bid lands on Organise; Mobilise on People;
            Assure on Overview.
          </p>
        </fieldset>
      )}

      <div className="mt-8 flex gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={() => {
              if (step === 0 && (!clientOrg.trim() || !serviceName.trim())) return;
              setStep((s) => s + 1);
            }}
          >
            Continue
          </Button>
        ) : (
          <Button type="button" disabled={create.isPending} onClick={() => void finish()}>
            Create engagement
          </Button>
        )}
      </div>
    </AppShell>
  );
}
