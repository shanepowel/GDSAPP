'use client';

import Link from 'next/link';
import { Check, Circle } from 'lucide-react';
import { useI18n } from '@/components/app/LocaleProvider';

export type WorkflowStepId = 'requirement' | 'team' | 'evidence' | 'analysis' | 'report';

export function EngagementWorkflowGuide({
  engagementId,
  steps,
}: {
  engagementId: string;
  steps: { id: WorkflowStepId; done: boolean; optional?: boolean }[];
}) {
  const { messages: m } = useI18n();
  const base = `/engagements/${engagementId}`;

  const meta: Record<
    WorkflowStepId,
    { href: string; label: string; hint: string }
  > = {
    requirement: {
      href: `${base}/requirement`,
      label: m.engagement.workflowStepRequirement,
      hint: m.engagement.workflowStepRequirementHint,
    },
    team: {
      href: `${base}/team`,
      label: m.engagement.workflowStepTeam,
      hint: m.engagement.workflowStepTeamHint,
    },
    evidence: {
      href: `${base}/evidence`,
      label: m.engagement.workflowStepEvidence,
      hint: m.engagement.workflowStepEvidenceHint,
    },
    analysis: {
      href: `${base}/analysis`,
      label: m.engagement.workflowStepAnalysis,
      hint: m.engagement.workflowStepAnalysisHint,
    },
    report: {
      href: `${base}/report`,
      label: m.engagement.workflowStepReport,
      hint: m.engagement.workflowStepReportHint,
    },
  };

  const nextId = steps.find((s) => !s.done)?.id;

  return (
    <section
      className="mb-8 rounded-xl border border-border bg-surface p-5 shadow-sm"
      aria-label={m.engagement.workflowTitle}
    >
      <h2 className="text-sm font-semibold text-text">{m.engagement.workflowTitle}</h2>
      <p className="mt-1 text-sm text-text-muted">{m.engagement.workflowIntro}</p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => {
          const info = meta[step.id];
          const isNext = step.id === nextId;
          return (
            <li key={step.id}>
              <Link
                href={info.href}
                className={`flex h-full flex-col rounded-lg border px-3 py-3 transition-colors hover:border-brand/40 hover:bg-brand-tint/30 ${
                  isNext ? 'border-brand bg-brand-tint/40' : 'border-border bg-bg'
                }`}
              >
                <div className="flex items-center gap-2">
                  {step.done ? (
                    <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                  ) : (
                    <Circle
                      className={`h-4 w-4 shrink-0 ${isNext ? 'text-brand' : 'text-text-muted'}`}
                      aria-hidden
                    />
                  )}
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    {m.engagement.workflowStep.replace('{n}', String(index + 1))}
                    {step.optional ? ` · ${m.engagement.workflowOptional}` : ''}
                  </span>
                </div>
                <span className="mt-2 text-sm font-semibold text-text">{info.label}</span>
                <span className="mt-1 text-xs leading-snug text-text-muted">{info.hint}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      {nextId && (
        <p className="mt-4 text-sm text-text">
          <span className="font-medium text-brand">{m.engagement.workflowUpNext}</span>{' '}
          {meta[nextId].label} — {meta[nextId].hint}
        </p>
      )}
    </section>
  );
}
