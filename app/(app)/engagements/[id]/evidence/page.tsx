'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { RequirementSelector } from '@/components/app/RequirementSelector';
import { Button } from '@/components/ui/Button';
import { useRequirementId } from '@/lib/hooks/use-requirement-id';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';
import { EVIDENCE_STRENGTHS } from '@/lib/engine/evidence-config';

export default function EvidencePage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const { data: engagement } = trpc.engagement.byId.useQuery({ id });
  const { requirementId, setRequirementId } = useRequirementId(id, engagement?.requirements);
  const { data, refetch } = trpc.extension.evidence.list.useQuery({ engagementId: id });
  const { data: points } = trpc.engagement.standardPoints.useQuery(
    { standardId: (engagement?.standardId ?? 'gds') as 'gds' | 'wales' },
    { enabled: !!engagement?.standardId },
  );
  const upsert = trpc.extension.evidence.upsert.useMutation({ onSuccess: () => refetch() });
  const remove = trpc.extension.evidence.delete.useMutation({ onSuccess: () => refetch() });

  const [title, setTitle] = useState('');
  const [type, setType] = useState('research report');
  const [strength, setStrength] = useState<(typeof EVIDENCE_STRENGTHS)[number]>('documented');
  const [pointIds, setPointIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  function togglePoint(pid: string) {
    setPointIds((prev) =>
      prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid],
    );
  }

  return (
    <AppShell title={m.engagement.evidenceTitle}>
      <AppNav />
      <EngagementSubNav engagementId={id} />
      {engagement && engagement.requirements.length > 1 && (
        <RequirementSelector
          requirements={engagement.requirements}
          value={requirementId}
          onChange={setRequirementId}
        />
      )}
      <p className="mb-4 text-sm text-text-muted">{m.engagement.evidenceIntro}</p>
      <form
        className="mb-8 space-y-4 rounded-lg border border-border bg-surface p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          upsert.mutate({
            engagementId: id,
            id: editingId ?? undefined,
            title,
            type,
            strength,
            links: pointIds.map((pointId) => ({ pointId })),
          });
          setTitle('');
          setPointIds([]);
          setEditingId(null);
        }}
      >
        <div className="flex flex-wrap gap-3">
          <input
            className="min-w-[200px] flex-1 rounded border border-border px-3 py-2 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="rounded border border-border px-3 py-2 text-sm"
            placeholder="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <select
            className="rounded border border-border px-3 py-2 text-sm"
            value={strength}
            onChange={(e) => setStrength(e.target.value as (typeof EVIDENCE_STRENGTHS)[number])}
          >
            {EVIDENCE_STRENGTHS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-text">{m.engagement.linkPoints}</legend>
          <div className="mt-2 max-h-40 overflow-y-auto rounded border border-border p-3">
            {points?.map((p) => (
              <label key={p.id} className="mb-1 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={pointIds.includes(p.id)}
                  onChange={() => togglePoint(p.id)}
                />
                <span>
                  {p.number}. {p.title}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit" disabled={upsert.isPending}>
          {editingId ? m.engagement.updateEvidence : m.engagement.addEvidence}
        </Button>
      </form>
      <ul className="space-y-3">
        {data?.map((e) => (
          <li key={e.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{e.title}</p>
                <p className="text-sm text-text-muted">
                  {e.type} · {e.strength.replace(/_/g, ' ')}
                </p>
                {e.links.length > 0 && (
                  <ul className="mt-2 text-xs text-text-muted">
                    {e.links.map((l) => (
                      <li key={l.id}>
                        Point: {l.pointId ?? '-'}
                        {l.questionId ? ` · Question ${l.questionId}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(e.id);
                    setTitle(e.title);
                    setType(e.type);
                    setStrength(e.strength as (typeof EVIDENCE_STRENGTHS)[number]);
                    setPointIds(e.links.map((l) => l.pointId).filter(Boolean) as string[]);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this evidence item?')) {
                      remove.mutate({ id: e.id, engagementId: id });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
