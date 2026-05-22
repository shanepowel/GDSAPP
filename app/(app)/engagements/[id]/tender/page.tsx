'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { RationaleDisclosure } from '@/components/app/RationaleDisclosure';
import { trpc } from '@/lib/trpc/client';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

export default function TenderPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: engagement, refetch } = trpc.engagement.byId.useQuery({ id });
  const { data: tenders, refetch: refetchTenders } = trpc.extension.tender.list.useQuery({ engagementId: id });
  const req = engagement?.requirements[0];
  const tender = tenders?.[0];
  const result = req?.runs[0]?.result as ExtendedAnalysisResult | undefined;
  const bidFromRun = result?.bidOutlook;

  const upsertTender = trpc.extension.tender.upsert.useMutation({
    onSuccess: () => refetchTenders(),
  });
  const addQuestion = trpc.extension.tender.addQuestion.useMutation({
    onSuccess: () => refetchTenders(),
  });
  const { data: liveOutlook } = trpc.extension.tender.bidOutlook.useQuery(
    { tenderId: tender?.id ?? '', requirementId: req?.id ?? '' },
    { enabled: !!tender?.id && !!req?.id },
  );
  const outlook = liveOutlook ?? bidFromRun;
  const buildScaffold = trpc.extension.tender.buildScaffold.useMutation();

  const [qRef, setQRef] = useState('Q1');
  const [qText, setQText] = useState('');

  return (
    <AppShell title="Bid evaluation">
      <p className="mb-4 text-sm text-text-muted">
        Manual tender setup: paste questions, map dependencies, view predicted bands and point-movers.
      </p>
      {!tender ? (
        <Button
          onClick={() =>
            upsertTender.mutate({
              engagementId: id,
              title: 'Procurement quality',
              buyer: engagement?.name ?? 'Buyer',
              qualityWeight: 0.7,
              priceWeight: 0.3,
            })
          }
        >
          Create tender
        </Button>
      ) : (
        <>
          <p className="text-sm">
            {tender.title} · Quality {Math.round(tender.qualityWeight * 100)}% / Price{' '}
            {Math.round(tender.priceWeight * 100)}% · Scale 0–{tender.scoringScaleMax}
          </p>
          <form
            className="mt-4 flex flex-wrap gap-2 rounded-lg border border-border bg-surface p-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!qText.trim()) return;
              addQuestion.mutate({
                tenderId: tender.id,
                ref: qRef,
                text: qText,
                weight: 1,
                category: 'capability',
              });
              setQText('');
            }}
          >
            <input
              className="w-16 rounded border border-border px-2 py-1 text-sm"
              value={qRef}
              onChange={(e) => setQRef(e.target.value)}
            />
            <input
              className="min-w-[240px] flex-1 rounded border border-border px-2 py-1 text-sm"
              placeholder="Question text"
              value={qText}
              onChange={(e) => setQText(e.target.value)}
            />
            <Button type="submit" size="sm">
              Add question
            </Button>
          </form>
          {outlook && (
            <div className="mt-6 rounded-lg border border-border bg-surface p-5">
              <h2 className="font-semibold">Quality outlook</h2>
              <p className="mt-2 text-2xl font-bold text-brand">{outlook.overallQualityOutlook}%</p>
              <h3 className="mt-4 text-sm font-semibold">Per question</h3>
              <ul className="mt-2 space-y-3">
                {outlook.questions.map((q) => (
                  <li key={q.questionId} className="rounded border border-border p-3 text-sm">
                    <span className="font-medium">{q.ref}</span>
                    {q.passFailRisk && (
                      <span className="ml-2 text-danger">Pass/fail risk</span>
                    )}
                    <p>
                      Predicted band {q.predictedBand} · Capability {q.capabilityCoverage}% · Evidence{' '}
                      {q.evidenceStrength}%
                    </p>
                    <RationaleDisclosure
                      rows={q.rationale.map((r) => ({
                        requirement: 'Rationale',
                        held: r,
                        match: 'partial' as const,
                      }))}
                    />
                    {req && (
                      <Button
                        variant="tertiary"
                        className="mt-2"
                        onClick={() =>
                          buildScaffold.mutate({
                            questionId: q.questionId,
                            requirementId: req.id,
                            tenderId: tender.id,
                          })
                        }
                      >
                        Generate answer scaffold
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              <h3 className="mt-4 text-sm font-semibold">Top point-movers</h3>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {outlook.topPointMovers.slice(0, 5).map((m) => (
                  <li key={m.text}>{m.text}</li>
                ))}
              </ul>
            </div>
          )}
          <a
            href={`/api/export/drafts?tenderId=${tender.id}`}
            className="mt-4 inline-block text-sm text-brand hover:underline"
          >
            Export drafts to Word
          </a>
        </>
      )}
      <Link href={`/engagements/${id}`} className="mt-6 inline-block text-sm text-brand hover:underline">
        Back to engagement
      </Link>
    </AppShell>
  );
}
