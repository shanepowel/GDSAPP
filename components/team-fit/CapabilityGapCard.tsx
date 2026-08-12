'use client';

import Link from 'next/link';

const REC_LABEL: Record<string, string> = {
  upskill: 'Upskill',
  second: 'Second / pair',
  recruit: 'Recruit',
  rescope: 'Rescope',
};

const KIND_LABEL: Record<string, string> = {
  skills_gap: 'Skills gap',
  rigour_gap: 'Rigour gap',
  capacity_gap: 'Capacity gap',
};

export function CapabilityGapCard({
  engagementId,
  displayTitle,
  kind,
  severity,
  recommendation,
  narrative,
  standardRefs,
  bestAvailableScore,
}: {
  engagementId: string;
  displayTitle: string;
  kind: string;
  severity: number;
  recommendation: string;
  narrative: string;
  standardRefs: string[];
  bestAvailableScore: number | null;
}) {
  return (
    <article
      className="border border-rule bg-stock-0 px-4 py-3"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-data text-[12px] font-medium text-signal-ink">
          {KIND_LABEL[kind] ?? kind} · severity {severity}
        </span>
        <h3 className="text-[15px] font-medium text-ink-0">{displayTitle}</h3>
      </div>
      <p className="mt-2 text-[15px] leading-[1.55] text-ink-1">{narrative}</p>
      {bestAvailableScore != null ? (
        <p className="mt-1 text-[13px] text-ink-1">
          Best available fit: {Math.round(bestAvailableScore * 100)}
        </p>
      ) : null}
      <p className="mt-2 text-[15px] text-ink-0">
        <span className="font-medium">Recommendation: </span>
        {REC_LABEL[recommendation] ?? recommendation}
      </p>
      {standardRefs.length > 0 ? (
        <p className="mt-2 text-[13px] text-ink-1">
          Standard points at risk: {standardRefs.join(', ')}
        </p>
      ) : null}
      <p className="mt-3">
        <Link
          href={`/engagements/${engagementId}/team/proposal`}
          className="text-[13px] font-medium text-signal-ink underline-offset-2 hover:underline"
        >
          Open squad proposal
        </Link>
      </p>
    </article>
  );
}
