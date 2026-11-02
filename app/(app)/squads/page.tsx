'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ButtonLink } from '@/components/library/Button';
import { DeliveryStatus } from '@/components/library/DeliveryStatus';
import { Field, TextInput } from '@/components/library/Field';
import { Cluster, Stack } from '@/components/library/layout';
import { Heading, Text } from '@/components/library/type';
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
    <Stack gap={5}>
      <Stack gap={2}>
        <Heading level={1}>{s.listTitle}</Heading>
        <Text>{s.listSub}</Text>
      </Stack>
      <div>
        <ButtonLink href="/engagements/new">{s.newEngagement}</ButtonLink>
      </div>
      <Field id="engagement-search" label={s.search}>
        <TextInput value={search} onChange={(event) => setSearch(event.target.value)} />
      </Field>
      <Cluster gap={3}>
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
      </Cluster>
      {query.isLoading ? <Text>{copy.ui.loading}</Text> : null}
      {query.isError ? <Text>{copy.ui.loadFailed}</Text> : null}
      {!query.isLoading && rows.length === 0 ? (
        <Stack gap={2}>
          <Heading level={2}>{copy.attention.emptyTitle}</Heading>
          <Text>{copy.attention.emptyBody}</Text>
        </Stack>
      ) : null}
      {!query.isLoading && rows.length > 0 && filtered.length === 0 ? (
        <Text>{fillCopy(s.noResults, { query: search || s.filterAll })}</Text>
      ) : null}
      {filtered.length > 0 ? (
        <div className="sheet overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{s.colEngagement}</th>
                <th>{s.colClient}</th>
                <th>{s.colStage}</th>
                <th>{s.colStatus}</th>
                <th>{s.colLead}</th>
                <th>{s.colMilestone}</th>
                <th>{s.colAction}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/squads/${row.id}/overview`} className="font-semibold underline-offset-2 hover:underline">
                      {row.name}
                    </Link>
                  </td>
                  <td>{row.client ?? s.missing}</td>
                  <td>{row.stage ? labels[row.stage] : s.missing}</td>
                  <td>
                    <DeliveryStatus status={row.status} label={statusLabel(copy, row.status)} />
                  </td>
                  <td>{row.squadLead ?? s.missing}</td>
                  <td>{row.milestone ? (row.milestoneOn ? fillCopy(s.milestoneWhen, { name: row.milestone, date: showDate(row.milestoneOn) }) : row.milestone) : s.missing}</td>
                  <td>{nextActionSentence(row.attention, copy.nextAction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Stack>
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
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([option, text]) => (
          <option key={option} value={option}>
            {text}
          </option>
        ))}
      </select>
    </Field>
  );
}
