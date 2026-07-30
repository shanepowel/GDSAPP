'use client';

import { GapCard } from '@/components/product/GapCard';
import { IndexValue } from '@/components/product/IndexValue';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';

export function PreparednessOverview({ engagementId }: { engagementId: string }) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.assurance.preparednessIndex.useQuery(
    { engagementId },
    { staleTime: 60_000 },
  );
  const autoMatch = trpc.assurance.autoMatchCapabilities.useMutation({
    onSuccess: () => void utils.assurance.preparednessIndex.invalidate({ engagementId }),
  });

  if (isLoading) {
    return <p className="text-sm text-ink-2">Computing preparedness index…</p>;
  }
  if (!data) return null;

  const { result, snapshots, expiring } = data;
  const previous = snapshots.length >= 2 ? snapshots[snapshots.length - 2]?.value ?? null : null;
  const chainCriterion =
    result.gaps[0]?.criterionId ?? result.byCriterion[0]?.criterionId ?? null;

  return (
    <section className="mb-8 space-y-6 border-b border-rule pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
            Preparedness index
          </p>
          <IndexValue
            value={result.index}
            previous={previous}
            engagementId={engagementId}
            criterionIdForChain={chainCriterion}
          />
          <p className="mt-2 font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
            Confidence: {result.confidence}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={autoMatch.isPending}
          onClick={() => autoMatch.mutate({ engagementId })}
        >
          Auto-match capabilities
        </Button>
      </div>

      {expiring.length > 0 && (
        <div className="rounded-[2px] border border-verdict-at-risk bg-verdict-at-risk-wash px-4 py-3">
          <p className="font-data text-[11px] uppercase tracking-[0.04em] text-verdict-at-risk">
            Expiring within 30 days
          </p>
          <ul className="mt-2 space-y-1 text-[15px] text-ink-0">
            {expiring.map((e) => (
              <li key={e.id}>
                {e.title}
                {e.expiresAt ? ` · ${e.expiresAt.toLocaleDateString('en-GB')}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {snapshots.length > 1 && (
        <div>
          <p className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
            Recent index movement
          </p>
          <ol className="mt-2 flex flex-wrap gap-2">
            {snapshots.map((s) => (
              <li
                key={s.computedAt.toISOString()}
                className="font-data rounded-[2px] border border-rule px-2 py-1 text-[11px] tabular-nums text-ink-1"
                title={s.cause ?? undefined}
              >
                {s.value ?? '—'}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div>
        <h2 className="text-[17px] font-semibold text-ink-0">Gaps</h2>
        {result.gaps.length === 0 ? (
          <p className="mt-2 text-[15px] text-ink-1">No gaps on applicable criteria.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {result.gaps.slice(0, 8).map((g) => (
              <li key={g.criterionId}>
                <GapCard
                  engagementId={engagementId}
                  criterionRef={g.criterionRef}
                  title={g.title}
                  reason={g.reason}
                  move={g.move}
                  statutory={g.statutory}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
