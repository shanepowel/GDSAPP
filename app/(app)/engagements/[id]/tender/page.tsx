'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { RequirementSelector } from '@/components/app/RequirementSelector';
import { useRequirementId } from '@/lib/hooks/use-requirement-id';
import { Button } from '@/components/ui/Button';
import { RationaleDisclosure } from '@/components/app/RationaleDisclosure';
import { useI18n } from '@/components/app/LocaleProvider';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';
import type { ParsedTenderQuestion } from '@/lib/tender/pdf-parser';
import { trpc } from '@/lib/trpc/client';
import type { ExtendedAnalysisResult } from '@/lib/types/extension';

export default function TenderPage() {
  const { messages: m } = useI18n();
  const features = getClientDeploymentFeatures();
  const params = useParams();
  const id = params.id as string;
  const { data: engagement } = trpc.engagement.byId.useQuery({ id });
  const { requirementId, setRequirementId } = useRequirementId(id, engagement?.requirements);
  const { data: tenders, refetch: refetchTenders } = trpc.extension.tender.list.useQuery({ engagementId: id });
  const req = engagement?.requirements.find((r) => r.id === requirementId) ?? engagement?.requirements[0];
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
  const importQuestions = trpc.extension.tender.importQuestions.useMutation({
    onSuccess: () => refetchTenders(),
  });

  const [qRef, setQRef] = useState('Q1');
  const [qText, setQText] = useState('');
  const [parsed, setParsed] = useState<ParsedTenderQuestion[]>([]);
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  const [parseError, setParseError] = useState('');
  const [parsing, setParsing] = useState(false);

  return (
    <AppShell
      title={features.clientAssuranceLabels ? 'Assurance criteria' : 'Call-off evaluation'}
    >
      <AppNav />
      <EngagementSubNav engagementId={id} />
      {engagement && engagement.requirements.length > 1 && (
        <RequirementSelector
          requirements={engagement.requirements}
          value={requirementId}
          onChange={setRequirementId}
        />
      )}
      <p className="mb-4 text-sm text-text-muted">
        {features.clientAssuranceLabels
          ? 'Map call-off specification criteria to roles, skills and standard points. View predicted assurance bands and gaps. For authority self-assurance, not supplier scoring.'
          : 'Call-off specification (not framework WPSQ): paste scored questions, map dependencies, view predicted bands and point-movers. Advisory only.'}
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

          <section className="mt-6 rounded-lg border border-border bg-surface p-4">
            <h2 className="font-semibold">{m.tender.importPdf}</h2>
            <p className="mt-1 text-sm text-text-muted">{m.tender.parseHint}</p>
            <input
              type="file"
              accept="application/pdf"
              className="mt-3 block text-sm"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setParseError('');
                setParsing(true);
                try {
                  const body = new FormData();
                  body.append('file', file);
                  const res = await fetch('/api/tender/parse-pdf', { method: 'POST', body });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error ?? 'Parse failed');
                  setParsed(json.questions as ParsedTenderQuestion[]);
                  setSelectedRefs(new Set(json.questions.map((q: ParsedTenderQuestion) => q.ref)));
                } catch (err) {
                  setParseError(err instanceof Error ? err.message : 'Parse failed');
                  setParsed([]);
                } finally {
                  setParsing(false);
                }
              }}
            />
            {parsing && <p className="mt-2 text-sm text-text-muted">{m.common.loading}</p>}
            {parseError && <p className="mt-2 text-sm text-status-gap">{parseError}</p>}
            {parsed.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium">{parsed.length} questions detected</p>
                <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
                  {parsed.map((q) => (
                    <li key={q.ref} className="flex gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRefs.has(q.ref)}
                        onChange={(e) => {
                          const next = new Set(selectedRefs);
                          if (e.target.checked) next.add(q.ref);
                          else next.delete(q.ref);
                          setSelectedRefs(next);
                        }}
                      />
                      <span>
                        <strong>{q.ref}</strong> ({q.confidence}) {q.text.slice(0, 120)}…
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-3"
                  disabled={importQuestions.isPending || selectedRefs.size === 0}
                  onClick={() => {
                    const toImport = parsed.filter((q) => selectedRefs.has(q.ref));
                    importQuestions.mutate({
                      tenderId: tender.id,
                      questions: toImport.map((q) => ({
                        ref: q.ref,
                        text: q.text,
                        weight: q.weight,
                        category: q.category,
                        isPassFail: q.isPassFail,
                      })),
                    });
                    setParsed([]);
                  }}
                >
                  {m.tender.importSelected}
                </Button>
              </div>
            )}
          </section>

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
              <h2 className="font-semibold">
                {features.clientAssuranceLabels ? 'Criteria outlook' : 'Quality outlook'}
              </h2>
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
              <h3 className="mt-4 text-sm font-semibold">
                {features.supplierWinFraming ? 'Top point-movers' : 'Priority assurance gaps'}
              </h3>
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
            {m.common.exportWord}
          </a>
        </>
      )}
      <Link href={`/engagements/${id}`} className="mt-6 inline-block text-sm text-brand hover:underline">
        Back to engagement
      </Link>
    </AppShell>
  );
}
