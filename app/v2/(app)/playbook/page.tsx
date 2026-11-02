import { BookOpen, FileText, ListChecks } from 'lucide-react';
import { Button, Card, CardHeader, Field, Input, PageHeader } from '@/components/assemble-v2';
import { handbookChapters, playbookTemplates } from '@/lib/assemble-v2/demo-data';

export const metadata = { title: 'Playbook' };

/** The DAA Delivery Handbook, templates and checklists in one place. */
export default function PlaybookPage() {
  return (
    <>
      <PageHeader title="Playbook" subtitle="Every template, checklist and standard we use, in one place." />
      <form role="search" className="max-w-md">
        <Field id="pb-q" label="Search the playbook"><Input id="pb-q" type="search" placeholder="For example, risk lock" /></Field>
      </form>
      <div className="flex flex-wrap items-start gap-4">
        <Card aria-labelledby="hb-h" className="min-w-0 flex-[1_1_360px]">
          <CardHeader id="hb-h" title="Handbook" description="Agile WOW: nine chapters" />
          <ol>
            {handbookChapters.map((c, i) => (
              <li key={c} className="border-b border-asm-line-soft last:border-b-0">
                <a href="#" className="flex items-center gap-3 px-6 py-3.5 hover:bg-asm-canvas">
                  <BookOpen size={18} className="text-asm-brand" aria-hidden="true" />
                  <span className="text-sm text-asm-ink-3 tabular-nums">{i + 1}</span>
                  <span className="font-semibold">{c}</span>
                </a>
              </li>
            ))}
          </ol>
        </Card>
        <Card aria-labelledby="tpl-h" className="min-w-0 flex-[2_1_520px] overflow-hidden">
          <CardHeader id="tpl-h" title="Templates" />
          <ul>
            {playbookTemplates.map((t) => (
              <li key={t.name} className="flex flex-wrap items-center gap-4 border-b border-asm-line-soft px-6 py-3.5 last:border-b-0">
                <FileText size={18} className="text-asm-brand" aria-hidden="true" />
                <span className="flex flex-1 basis-64 flex-col"><span className="font-semibold">{t.name}</span><span className="text-[13px] text-asm-ink-3">{t.chapter} · {t.use}</span></span>
                <Button size="sm" variant="secondary">Use in an engagement<span className="sr-only">: {t.name}</span></Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card aria-labelledby="cl-h">
        <CardHeader id="cl-h" title="Checklists" />
        <div className="flex flex-wrap gap-3 px-6 py-5">
          {['Sprint Zero exit', 'Definition of Ready', 'Definition of Done', 'Compliance', 'Governance for new engagements', 'Handover Pack'].map((c) => (
            <span key={c} className="flex items-center gap-2 rounded-asm border border-asm-line px-3.5 py-2.5 text-sm font-semibold text-asm-brand"><ListChecks size={16} aria-hidden="true" />{c}</span>
          ))}
        </div>
      </Card>
    </>
  );
}
