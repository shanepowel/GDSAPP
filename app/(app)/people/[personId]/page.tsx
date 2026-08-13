'use client';

import { useParams } from 'next/navigation';
import { PageHeader, TextLink } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { trpc } from '@/lib/trpc/client';

export default function PersonDetailPage() {
  const params = useParams();
  const id = params.personId as string;
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const { data } = trpc.orgDesign.graph.useQuery();
  const { data: signals } = trpc.teamFit.orgRigour.useQuery();
  const person = data?.people?.find((p) => p.id === id);
  const assignments = (data?.assignments ?? []).filter((a) => a.personId === id);
  const entities = data?.entities ?? [];
  const rigour = (signals ?? []).filter((s) => s.personId === id);

  if (!person) {
    return <p className="text-[color:var(--graphite)]">{copy.ui.loading}</p>;
  }

  return (
    <>
      <p className="mb-4">
        <TextLink href="/people">← {copy.people.pool}</TextLink>
      </p>
      <PageHeader
        eyebrow={copy.people.eyebrow}
        title={person.name}
        lede={fillCopy(copy.people.personLede, {
          fte: (person.fte / 100).toFixed(1),
          count: assignments.length,
        })}
      />

      <h2 className="mt-8 mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.people.skillsHeld}
      </h2>
      {person.skills.length ? (
        <ul className="sheet divide-y divide-[color:var(--rule-soft)]">
          {person.skills.map((s) => (
            <li key={s} className="px-4 py-2">
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[color:var(--graphite)]">{copy.people.noSkills}</p>
      )}

      <h2 className="mt-8 mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.people.assignments}
      </h2>
      {assignments.length ? (
        <ul className="sheet divide-y divide-[color:var(--rule-soft)]">
          {assignments.map((a) => (
            <li key={a.id} className="flex justify-between px-4 py-2">
              <span>{entities.find((e) => e.id === a.entityId)?.name ?? a.entityId}</span>
              <span className="font-data">{a.allocation}%</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[color:var(--graphite)]">{copy.people.noAssignments}</p>
      )}

      <h2 className="mt-8 mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.people.rigourSignals}
      </h2>
      {rigour.length === 0 ? (
        <div className="border-l-2 border-[color:var(--graphite)] bg-[var(--raised)] px-4 py-3 text-sm">
          <p>{copy.empty.noSignals}</p>
        </div>
      ) : (
        <div className="sheet">
          {rigour.map((r, i) => (
            <div
              key={`${r.type}-${i}`}
              className="grid grid-cols-[1fr_80px_60px] gap-2 border-b border-[color:var(--rule-soft)] px-4 py-2 last:border-b-0"
            >
              <div>
                {r.type.replaceAll('_', ' ')}
                {r.note ? (
                  <div className="font-data text-[10px] text-[color:var(--graphite)]">{r.note}</div>
                ) : null}
              </div>
              <div className="font-data text-right text-[color:var(--graphite)]">{r.provenance}</div>
              <div className="font-data text-right tabular-nums">{r.value.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
