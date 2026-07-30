'use client';

import Link from 'next/link';
import type { GapListItem } from '@/lib/crosswalk/gap-list';

const SECTION_META: Record<
  GapListItem['category'],
  { title: string; empty: string; accent: string }
> = {
  'answerable-now': {
    title: 'Answerable now',
    empty: 'No pack items are ready to assemble yet.',
    accent: 'var(--verdict-met)',
  },
  'evidence-gap': {
    title: 'Evidence gap',
    empty: 'No evidence gaps in mapped items.',
    accent: 'var(--verdict-at-risk)',
  },
  'out-of-scope': {
    title: 'Out of scope',
    empty: 'Every pack item has a mapping.',
    accent: 'var(--ink-2)',
  },
};

function GapSection({
  category,
  items,
  engagementId,
}: {
  category: GapListItem['category'];
  items: GapListItem[];
  engagementId: string;
}) {
  const meta = SECTION_META[category];
  return (
    <section aria-labelledby={`gap-${category}`} className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span
          className="inline-block h-2 w-2 shrink-0"
          style={{ background: meta.accent }}
          aria-hidden
        />
        <h3 id={`gap-${category}`} className="text-[15px] font-semibold text-ink-0">
          {meta.title}
        </h3>
        <span className="font-data text-[12px] text-ink-2">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-[13px] text-ink-2">{meta.empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((row) => (
            <li
              key={row.itemId}
              className="border border-rule-soft bg-stock-0 px-3 py-2"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <p className="font-data text-[11px] text-ink-2">{row.ref}</p>
              <p className="text-[14px] font-medium text-ink-0">{row.title}</p>
              <p className="mt-1 text-[13px] text-ink-1">{row.reason}</p>
              {row.mappings.length > 0 && (
                <p className="mt-2 flex flex-wrap gap-2 text-[12px]">
                  {row.mappings.map((m) => (
                    <Link
                      key={m.criterionId}
                      href={`/engagements/${engagementId}/assess/${encodeURIComponent(m.criterionRef)}`}
                      className="font-data text-signal-ink underline-offset-2 hover:underline"
                    >
                      {m.criterionRef}
                    </Link>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function GatePackGapList({
  engagementId,
  answerableNow,
  evidenceGap,
  outOfScope,
}: {
  engagementId: string;
  answerableNow: GapListItem[];
  evidenceGap: GapListItem[];
  outOfScope: GapListItem[];
}) {
  return (
    <section aria-labelledby="gap-list-heading" className="space-y-6">
      <h2 id="gap-list-heading" className="text-[17px] font-semibold text-ink-0">
        Gap list
      </h2>
      <GapSection category="answerable-now" items={answerableNow} engagementId={engagementId} />
      <GapSection category="evidence-gap" items={evidenceGap} engagementId={engagementId} />
      <GapSection category="out-of-scope" items={outOfScope} engagementId={engagementId} />
    </section>
  );
}
