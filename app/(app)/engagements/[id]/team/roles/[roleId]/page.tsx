'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { FitBreakdownPanel, FitStrip } from '@/components/team-fit/FitStrip';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';
import type { FitBand, FitBreakdown } from '@/lib/scoring/fit';

export default function TeamFitRoleCandidatesPage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const roleId = params.roleId as string;
  const { data } = trpc.teamFit.roleCandidates.useQuery({
    engagementId: id,
    archetypeRoleId: roleId,
  });
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <AppShell title={m.teamFit.candidatesTitle}>
      <AppNav />
      <EngagementSubNav engagementId={id} />
      <p className="mb-2">
        <Link href={`/engagements/${id}/team`} className="text-sm text-brand hover:underline">
          ← {m.teamFit.title}
        </Link>
      </p>
      {data ? (
        <>
          <h2 className="text-lg font-medium">{data.role.displayTitle}</h2>
          <p className="mb-4 text-sm text-text-muted">
            {data.role.minLevel} · {data.role.fteRequired} FTE · {data.role.criticality}
          </p>
          <ul className="space-y-2">
            {data.candidates.map((c) => {
              const breakdown = c.breakdown as unknown as FitBreakdown;
              const unevidenced = breakdown.notes?.includes('no_rigour_signals');
              const open = openId === c.id;
              return (
                <li key={c.id} className="rounded-lg border border-border bg-surface p-4">
                  <button
                    type="button"
                    className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : c.id)}
                  >
                    <span className="font-medium">{c.personName}</span>
                    <FitStrip
                      band={c.band as FitBand}
                      compositeScore={c.compositeScore}
                      unevidenced={unevidenced}
                    />
                  </button>
                  {open ? <FitBreakdownPanel breakdown={breakdown} /> : null}
                  <p className="mt-2 text-xs text-text-muted">
                    Skill {Math.round(c.skillScore * 100)} · Rigour ×{c.rigourMultiplier.toFixed(2)} ·{' '}
                    {m.teamFit.computedAt} {new Date(c.computedAt).toLocaleString()}
                  </p>
                </li>
              );
            })}
            {data.candidates.length === 0 ? (
              <li className="text-sm text-text-muted">{m.teamFit.noCandidates}</li>
            ) : null}
          </ul>
        </>
      ) : (
        <p>{m.engagement.loading}</p>
      )}
    </AppShell>
  );
}
