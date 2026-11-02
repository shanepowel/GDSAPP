'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ButtonLink } from '@/components/library/Button';
import { Card } from '@/components/library/Card';
import { DeliveryStatus } from '@/components/library/DeliveryStatus';
import { EmptyState } from '@/components/library/EmptyState';
import { Field, SelectInput, TextInput } from '@/components/library/Field';
import { PageHeader } from '@/components/library/PageHeader';
import { Table, TableScroll, Td, Th } from '@/components/library/Table';
import { lifecycleLabels, showDate, statusLabel } from '@/components/engagement/shared';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { nextActionSentence } from '@/lib/attention/sentence';
import { trpc } from '@/lib/trpc/client';

export default function SquadsIndexPage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const s = copy.spine;
  const query = trpc.spine.board.useQuery();
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('all');
  const [status, setStatus] = useState('all');
  const [client, setClient] = useState('all');
  const [lead, setLead] = useState('all');
  const [sector, setSector] = useState('all');
  const labels = lifecycleLabels(copy);
  const rows = useMemo(() => query.data?.engagements ?? [], [query.data?.engagements]);
  const clients = useMemo(() => [...new Set(rows.map((row) => row.client).filter(Boolean))] as string[], [rows]);
  const leads = useMemo(() => [...new Set(rows.map((row) => row.squadLead).filter(Boolean))] as string[], [rows]);
  const sectors = useMemo(() => [...new Set(rows.map((row) => row.sector).filter(Boolean))] as string[], [rows]);
  const filtered = rows.filter((row) => {
    const haystack = `${row.name} ${row.client ?? ''}`.toLowerCase();
    if (search && !haystack.includes(search.trim().toLowerCase())) return false;
    if (stage !== 'all' && row.stage !== stage) return false;
    if (status !== 'all' && row.status !== status) return false;
    if (client !== 'all' && row.client !== client) return false;
    if (lead !== 'all' && row.squadLead !== lead) return false;
    if (sector !== 'all' && row.sector !== sector) return false;
    return true;
  });

  return (
    <div className="asm-root flex flex-col gap-6">
      <PageHeader title={s.listTitle} subtitle={s.listSub} actions={<ButtonLink href="/engagements/new">{s.newEngagement}</ButtonLink>} />
      <Card className="flex flex-col gap-4 p-5">
        <Field id="engagement-search" label={s.search}>
          <TextInput type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <Filter label={s.filterStage} value={stage} onChange={setStage} options={[['all', s.filterAll], ...Object.entries(labels)]} />
          <Filter
            label={s.filterStatus}
            value={status}
            onChange={setStatus}
            options={[
              ['all', s.filterAll],
              ['on-track', copy.status.onTrack],
              ['at-risk', copy.status.atRisk],
              ['off-track', copy.status.offTrack],
            ]}
          />
          <Filter label={s.filterClient} value={client} onChange={setClient} options={[['all', s.filterAll], ...clients.map((item) => [item, item] as const)]} />
          <Filter label={s.filterLead} value={lead} onChange={setLead} options={[['all', s.filterAll], ...leads.map((item) => [item, item] as const)]} />
          <Filter
            label={s.filterSector}
            value={sector}
            onChange={setSector}
            options={[
              ['all', s.filterAll],
              ...sectors.map((item) => [item, s.sectors[item as keyof typeof s.sectors] ?? item] as const),
            ]}
          />
        </div>
      </Card>
      {query.isLoading ? <p className="m-0 text-asm-ink-3">{copy.ui.loading}</p> : null}
      {query.isError ? <p className="m-0 text-asm-ink-3">{copy.ui.loadFailed}</p> : null}
      {!query.isLoading && rows.length === 0 ? (
        <EmptyState title={copy.attention.emptyTitle} body={copy.attention.emptyBody} action={<ButtonLink href="/engagements/new">{s.newEngagement}</ButtonLink>} />
      ) : null}
      {!query.isLoading && rows.length > 0 && filtered.length === 0 ? (
        <p role="status" className="m-0 text-asm-ink-2">
          {fillCopy(s.noResults, { query: search || s.filterAll })}
        </p>
      ) : null}
      {filtered.length > 0 ? (
        <Card>
          <TableScroll minWidth={1040}>
            <Table>
              <thead>
                <tr>
                  <Th>{s.colEngagement}</Th>
                  <Th>{s.colStage}</Th>
                  <Th>{s.colStatus}</Th>
                  <Th>{s.colLead}</Th>
                  <Th>{s.colMilestone}</Th>
                  <Th>{s.colAction}</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-asm-brand-wash">
                    <Td>
                      <span className="flex flex-col gap-0.5">
                        <Link href={`/squads/${row.id}/overview`} className="font-semibold text-asm-brand underline-offset-2 hover:underline">
                          {row.name}
                        </Link>
                        <span className="text-[13px] text-asm-ink-3">{row.client ?? s.missing}</span>
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap">{row.stage ? labels[row.stage] : s.missing}</Td>
                    <Td>
                      <DeliveryStatus status={row.status} label={statusLabel(copy, row.status)} size="sm" />
                    </Td>
                    <Td className="whitespace-nowrap text-asm-ink-2">{row.squadLead ?? s.missing}</Td>
                    <Td className="text-asm-ink-2">
                      {row.milestone ? (row.milestoneOn ? fillCopy(s.milestoneWhen, { name: row.milestone, date: showDate(row.milestoneOn) }) : row.milestone) : s.missing}
                    </Td>
                    <Td className="max-w-[320px] text-asm-ink-2">{nextActionSentence(row.attention, copy.nextAction)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        </Card>
      ) : null}
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  const id = `filter-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <Field id={id} label={label}>
      <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([option, text]) => (
          <option key={option} value={option}>
            {text}
          </option>
        ))}
      </SelectInput>
    </Field>
  );
}
