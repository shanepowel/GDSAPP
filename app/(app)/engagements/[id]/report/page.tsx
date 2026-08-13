'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { TitleBlock } from '@/components/product/TitleBlock';
import { IndexValue } from '@/components/product/IndexValue';
import { GapCard } from '@/components/product/GapCard';
import { ProvenanceChip } from '@/components/product/ProvenanceChip';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';
import type { ReportSectionId } from '@/lib/export/assurance-report';

const OPTIONAL_SECTIONS: { id: ReportSectionId; label: string }[] = [
  { id: 'overview', label: 'Preparedness overview' },
  { id: 'gaps', label: 'Gaps' },
  { id: 'evidence', label: 'Evidence ledger' },
];

export default function ReportPage() {
  const { messages: m, locale } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const [sections, setSections] = useState<ReportSectionId[]>(['overview', 'gaps', 'evidence']);
  const [exportError, setExportError] = useState<string | null>(null);

  const bundle = trpc.assurance.reportBundle.useQuery({
    engagementId: id,
    sections,
    locale: locale === 'cy' ? 'cy' : 'en',
  });

  const pdfHref = useMemo(() => {
    const q = new URLSearchParams({
      engagementId: id,
      sections: sections.join(','),
      locale: locale === 'cy' ? 'cy' : 'en',
    });
    return `/api/export/report?${q.toString()}`;
  }, [id, sections, locale]);

  function toggleSection(section: ReportSectionId) {
    setSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  }

  async function downloadPdf() {
    setExportError(null);
    const res = await fetch(pdfHref);
    if (res.status === 409) {
      const body = (await res.json()) as { error?: string };
      setExportError(body.error ?? 'Welsh export blocked — use English or review translations.');
      return;
    }
    if (!res.ok) {
      setExportError('Could not generate PDF.');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assurance-report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const payload = bundle.data;

  return (
    <AppShell title={m.engagement.reportTitle}>

      <header className="mb-6 no-print">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink-0">
          {m.engagement.reportTitle}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-[1.55] text-ink-1">
          Same TitleBlock and preparedness scoring as the screen. The judgement register always
          ships with the PDF.
        </p>
      </header>

      <fieldset className="mb-6 no-print space-y-2 border border-rule bg-stock-0 px-4 py-3">
        <legend className="px-1 text-[13px] font-medium text-ink-1">Sections</legend>
        <div className="flex flex-wrap gap-3">
          {OPTIONAL_SECTIONS.map((s) => (
            <label key={s.id} className="inline-flex items-center gap-2 text-[13px] text-ink-0">
              <input
                type="checkbox"
                checked={sections.includes(s.id)}
                onChange={() => toggleSection(s.id)}
              />
              {s.label}
            </label>
          ))}
          <label className="inline-flex items-center gap-2 text-[13px] text-ink-2">
            <input type="checkbox" checked disabled readOnly />
            Judgement register (required)
          </label>
        </div>
      </fieldset>

      <div className="mb-8 flex flex-wrap gap-3 no-print">
        <Button type="button" onClick={() => void downloadPdf()}>
          {m.common.exportPdf}
        </Button>
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          Print
        </Button>
      </div>
      {exportError && (
        <p className="mb-4 rounded-[2px] border border-verdict-not-met bg-verdict-not-met-wash px-3 py-2 text-[13px] text-ink-0 no-print">
          {exportError}
        </p>
      )}
      {bundle.error && (
        <p className="mb-4 text-[13px] text-ink-1 no-print">
          {bundle.error.message.includes('machine')
            ? bundle.error.message
            : 'Could not load report bundle.'}
        </p>
      )}

      {payload && (
        <article className="mx-auto max-w-[210mm] space-y-8 font-[family-name:var(--font-doc)] text-ink-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <TitleBlock data={payload.titleBlock} />
            <p className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
              {payload.confidentiality === 'internal'
                ? 'Confidential — internal'
                : payload.confidentiality === 'client'
                  ? 'Confidential — client'
                  : 'Publishable'}
            </p>
          </div>

          {sections.includes('overview') && (
            <section>
              <h2 className="text-[17px] font-semibold">Preparedness overview</h2>
              <div className="mt-3">
                <IndexValue
                  value={payload.scoring.index}
                  previous={null}
                  engagementId={id}
                  criterionIdForChain={payload.scoring.gaps[0]?.criterionId ?? null}
                />
                <p className="mt-2 font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
                  Confidence: {payload.scoring.confidence}
                </p>
              </div>
            </section>
          )}

          {sections.includes('gaps') && (
            <section>
              <h2 className="mb-3 text-[17px] font-semibold">Gaps</h2>
              {payload.gaps.length === 0 ? (
                <p className="text-[15px] text-ink-1">No open gaps in the current index.</p>
              ) : (
                <div className="space-y-3">
                  {payload.gaps.map((g) => (
                    <GapCard
                      key={g.criterionRef}
                      engagementId={id}
                      criterionRef={g.criterionRef}
                      title={g.title}
                      reason={g.reason}
                      move={g.move}
                      statutory={g.statutory}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {sections.includes('evidence') && (
            <section>
              <h2 className="mb-3 text-[17px] font-semibold">Evidence ledger</h2>
              {payload.evidence.length === 0 ? (
                <p className="text-[15px] text-ink-1">No evidence recorded.</p>
              ) : (
                <ul className="divide-y divide-rule-soft border-y border-rule">
                  {payload.evidence.map((e) => (
                    <li key={e.id} className="py-3">
                      <p className="font-medium">{e.title}</p>
                      <p className="mt-1 font-data text-[11px] uppercase text-ink-2">
                        {e.kind} · {e.confidentiality} · points {e.criterionRefs.join(', ') || '—'}
                      </p>
                      <div className="mt-2">
                        <ProvenanceChip
                          kind={
                            e.sourceSystem === 'github'
                              ? 'github'
                              : e.provenance === 'integration'
                                ? 'integration'
                                : e.provenance === 'import'
                                  ? 'import'
                                  : 'manual'
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section>
            <h2 className="mb-2 text-[17px] font-semibold">Judgement register</h2>
            <p className="mb-3 text-[13px] text-ink-1">
              Required appendix — every current judgement with provenance.
            </p>
            {payload.judgements.length === 0 ? (
              <p className="text-[15px] text-ink-1">No judgements yet.</p>
            ) : (
              <ul className="space-y-4">
                {payload.judgements.map((j) => (
                  <li key={`${j.criterionRef}-${j.confirmedAt}`} className="border-b border-rule-soft pb-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-data text-[12px] text-signal-ink">{j.criterionRef}</span>
                      <span className="font-medium">{j.criterionTitle}</span>
                      <span className="font-data text-[11px] uppercase text-ink-2">{j.verdict}</span>
                    </div>
                    <p className="mt-2 text-[15px] leading-[1.55]">{j.rationale}</p>
                    <p className="mt-2 font-data text-[11px] text-ink-2">
                      {j.provenanceLabel} · {j.confirmedAt.slice(0, 10)}
                      {j.aiModel ? ` · ${j.aiModel}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <footer className="border-t border-rule pt-3 font-data text-[11px] text-ink-2">
            Assemble v{payload.productVersion} · Generated {payload.generatedAt}
          </footer>
        </article>
      )}
    </AppShell>
  );
}
