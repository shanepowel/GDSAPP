'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { Button } from '@/components/ui/Button';
import { ProvenanceChip } from '@/components/product/ProvenanceChip';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

const KINDS = ['document', 'research', 'test', 'decision', 'code', 'metric', 'other'] as const;

export default function EvidenceLedgerPage() {
  const { messages: m, locale } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const utils = trpc.useUtils();

  const { data, refetch } = trpc.assurance.listEvidence.useQuery({ engagementId: id });
  const criteria = trpc.standards.assessList.useQuery({
    engagementId: id,
    locale: locale === 'cy' ? 'cy' : 'en',
    ignorePhaseFilter: true,
  });
  const upsert = trpc.assurance.upsertEvidence.useMutation({
    onSuccess: () => {
      void refetch();
      void utils.assurance.listEvidence.invalidate();
    },
  });
  const remove = trpc.assurance.deleteEvidence.useMutation({
    onSuccess: () => void refetch(),
  });

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<(typeof KINDS)[number]>('research');
  const [uri, setUri] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [criterionIds, setCriterionIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  function toggleCriterion(cid: string) {
    setCriterionIds((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid],
    );
  }

  return (
    <AppShell title={m.engagement.evidenceTitle}>
      <AppNav />
      <EngagementSubNav engagementId={id} />
      <p className="mb-4 text-sm text-ink-1">{m.engagement.evidenceIntro}</p>

      <form
        className="mb-8 space-y-4 rounded-[2px] border border-rule bg-stock-0 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || criterionIds.length < 1) return;
          upsert.mutate({
            engagementId: id,
            id: editingId ?? undefined,
            title: title.trim(),
            kind,
            uri: uri.trim() || null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            criterionIds,
            provenance: 'manual',
          });
          setTitle('');
          setUri('');
          setExpiresAt('');
          setCriterionIds([]);
          setEditingId(null);
        }}
      >
        <h2 className="text-[17px] font-semibold text-ink-0">
          {editingId ? 'Update evidence' : m.engagement.addEvidence}
        </h2>
        <label className="block text-[13px] font-medium text-ink-1">
          Title
          <input
            className="mt-1 block w-full rounded-[2px] border border-rule px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <label className="block text-[13px] font-medium text-ink-1">
            Kind
            <select
              className="mt-1 block rounded-[2px] border border-rule px-3 py-2 text-sm"
              value={kind}
              onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[13px] font-medium text-ink-1">
            URI
            <input
              className="mt-1 block rounded-[2px] border border-rule px-3 py-2 text-sm"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
            />
          </label>
          <label className="block text-[13px] font-medium text-ink-1">
            Expires
            <input
              type="date"
              className="mt-1 block rounded-[2px] border border-rule px-3 py-2 text-sm"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </label>
        </div>
        <fieldset>
          <legend className="text-[13px] font-medium text-ink-1">{m.engagement.linkPoints}</legend>
          <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
            {(criteria.data?.criteria ?? []).map((c) => (
              <label
                key={c.id}
                className="inline-flex items-center gap-1 rounded-[2px] border border-rule px-2 py-1 text-xs"
              >
                <input
                  type="checkbox"
                  checked={criterionIds.includes(c.id)}
                  onChange={() => toggleCriterion(c.id)}
                />
                <span className="font-data">{c.ref}</span> {c.title}
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit" disabled={upsert.isPending || criterionIds.length < 1}>
          {editingId ? m.engagement.updateEvidence : m.engagement.addEvidence}
        </Button>
      </form>

      {!data?.length ? (
        <p className="rounded-[2px] border border-rule bg-stock-1 px-4 py-6 text-[15px] text-ink-1">
          No evidence yet. Evidence is what turns a judgement into something a panel can check.
        </p>
      ) : (
        <ul className="divide-y divide-rule-soft border-y border-rule">
          {data.map((row) => (
            <li key={row.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div>
                <p className="font-medium text-ink-0">{row.title}</p>
                <p className="mt-1 font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
                  {row.kind} · {row.linkedCriteriaCount} criteria · {row.freshness}
                </p>
                <div className="mt-2">
                  <ProvenanceChip kind={row.provenance} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingId(row.id);
                    setTitle(row.title);
                    setKind(row.kind as (typeof KINDS)[number]);
                    setUri(row.uri ?? '');
                    setExpiresAt(
                      row.expiresAt ? row.expiresAt.toISOString().slice(0, 10) : '',
                    );
                    setCriterionIds(row.criteria.map((c) => c.criterionId));
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => remove.mutate({ engagementId: id, id: row.id })}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
