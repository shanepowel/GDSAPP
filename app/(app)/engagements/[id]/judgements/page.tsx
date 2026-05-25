'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { DeploymentBanner } from '@/components/app/DeploymentBanner';
import { RequirementSelector } from '@/components/app/RequirementSelector';
import { Button } from '@/components/ui/Button';
import { useRequirementId } from '@/lib/hooks/use-requirement-id';
import { trpc } from '@/lib/trpc/client';

const SUBJECT_TYPES = [
  { value: 'readiness_overall', label: 'Overall readiness' },
  { value: 'readiness_point', label: 'Standard point' },
  { value: 'rigour_overall', label: 'Agile rigour' },
  { value: 'bid_question', label: 'Call-off question' },
  { value: 'evidence', label: 'Evidence item' },
] as const;

const STATUSES = ['approved', 'rejected', 'deferred', 'override'] as const;

export default function JudgementsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: engagement } = trpc.engagement.byId.useQuery({ id });
  const { data: judgements, refetch: refetchJudgements } = trpc.extension.judgement.list.useQuery({
    engagementId: id,
  });
  const { requirementId, setRequirementId, activeRequirement } = useRequirementId(
    id,
    engagement?.requirements,
  );

  const record = trpc.extension.judgement.record.useMutation({
    onSuccess: () => {
      refetchJudgements();
      setSubjectType('readiness_overall');
      setStatus('approved');
      setOverrideReason('');
    },
  });

  const [subjectType, setSubjectType] = useState<string>('readiness_overall');
  const [subjectId, setSubjectId] = useState('');
  const [status, setStatus] = useState<string>('approved');
  const [decidedBy, setDecidedBy] = useState('Assessor');
  const [overrideReason, setOverrideReason] = useState('');
  const [score, setScore] = useState('');

  const effectiveSubjectId =
    subjectId.trim() ||
    (subjectType === 'readiness_overall' && requirementId ? requirementId : 'general');

  return (
    <AppShell title="Human judgements" standardId={engagement?.standardId}>
      <DeploymentBanner />
      <AppNav />
      <p className="mb-4 text-sm text-text-muted">
        Record assessor decisions alongside deterministic scores. Advisory tool: judgements do not
        replace formal procurement or sift decisions.
      </p>
      {engagement?.requirements && (
        <RequirementSelector
          requirements={engagement.requirements}
          value={requirementId}
          onChange={setRequirementId}
        />
      )}

      <form
        className="mb-8 max-w-xl rounded-2xl border border-border bg-surface p-5"
        onSubmit={(e) => {
          e.preventDefault();
          record.mutate({
            engagementId: id,
            subjectType,
            subjectId: effectiveSubjectId,
            status,
            decidedBy: decidedBy.trim() || 'Assessor',
            overrideReason: overrideReason.trim() || undefined,
            score: score.trim() ? Number(score) : undefined,
          });
        }}
      >
        <h2 className="font-semibold">Record judgement</h2>
        <div className="mt-4 grid gap-3">
          <label className="text-sm">
            Subject type
            <select
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
              value={subjectType}
              onChange={(e) => setSubjectType(e.target.value)}
            >
              {SUBJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Subject id (optional; defaults to active requirement)
            <input
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder={activeRequirement?.id ?? 'cuid or ref'}
            />
          </label>
          <label className="text-sm">
            Status
            <select
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Decided by
            <input
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
              value={decidedBy}
              onChange={(e) => setDecidedBy(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Score override (0–100, optional)
            <input
              type="number"
              min={0}
              max={100}
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Rationale
            <textarea
              className="mt-1 w-full rounded-md border border-border px-3 py-2"
              rows={3}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Why this judgement differs from or confirms the engine output"
            />
          </label>
        </div>
        <Button type="submit" className="mt-4" disabled={record.isPending}>
          Save judgement
        </Button>
      </form>

      <section>
        <h2 className="font-semibold">History</h2>
        <ul className="mt-3 space-y-3">
          {judgements?.map((j) => (
            <li key={j.id} className="rounded-lg border border-border bg-surface p-4 text-sm">
              <p className="font-medium">
                {j.status} · {j.subjectType}
              </p>
              <p className="text-text-muted">
                {j.decidedBy ?? 'Unknown'} · {new Date(j.decidedAt).toLocaleString('en-GB')}
              </p>
              {j.score != null && <p>Score: {j.score}</p>}
              {j.overrideReason && <p className="mt-1">{j.overrideReason}</p>}
            </li>
          ))}
          {!judgements?.length && (
            <p className="text-sm text-text-muted">No judgements recorded yet.</p>
          )}
        </ul>
      </section>

      <Link href={`/engagements/${id}`} className="mt-6 inline-block text-sm text-brand hover:underline">
        Back to overview
      </Link>
    </AppShell>
  );
}
