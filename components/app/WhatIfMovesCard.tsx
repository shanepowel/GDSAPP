'use client';

import { ArrowRight, CircleCheck, Wand2 } from 'lucide-react';
import { Card } from '@/components/app/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

export function WhatIfMovesCard({
  engagementId,
  requirementId,
  onUpdated,
}: {
  engagementId: string;
  requirementId: string;
  onUpdated: () => void;
}) {
  const { messages: m } = useI18n();
  const { data, refetch } = trpc.engagement.whatIfMoves.useQuery({ engagementId });
  const toggle = trpc.engagement.toggleWhatIfMove.useMutation({
    onSuccess: () => {
      refetch();
      onUpdated();
    },
  });

  if (!data?.moves.length) return null;

  return (
    <div className="space-y-4">
      <Card className="p-5" style={{ background: 'var(--tt-blue-050)', border: 'none' }}>
        <div className="flex items-start gap-2">
          <Wand2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <p className="text-sm text-text">{m.engagement.whatIfIntro}</p>
        </div>
      </Card>
      {data.moves.map((mv) => {
        const on = data.applied.includes(mv.id);
        return (
          <Card key={mv.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="font-semibold text-text">{mv.label}</div>
                <p className="mt-1 text-sm text-text-muted">{mv.note}</p>
              </div>
              <Button
                type="button"
                variant={on ? 'secondary' : 'primary'}
                disabled={toggle.isPending}
                onClick={() =>
                  toggle.mutate({
                    engagementId,
                    requirementId,
                    moveId: mv.id,
                    apply: !on,
                  })
                }
              >
                {on ? (
                  <>
                    <CircleCheck className="h-4 w-4" aria-hidden />
                    {m.engagement.applied}
                  </>
                ) : (
                  <>
                    {m.engagement.applyMove}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </>
                )}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
