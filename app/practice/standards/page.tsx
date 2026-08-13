'use client';

import { PageHeader } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { DONE_ITEMS, KEEL_SUMMARY, READY_ITEMS } from '@/lib/practice';

export default function StandardsPage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const split = `${KEEL_SUMMARY.capacitySplit.committed * 100}/${KEEL_SUMMARY.capacitySplit.discretionary * 100}/${KEEL_SUMMARY.capacitySplit.slack * 100}`;

  return (
    <>
      <PageHeader
        eyebrow={copy.nav.practice.label}
        title={copy.practice.standardsTitle}
        lede={copy.practice.standardsLede}
      />

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.practice.readyTitle}
      </h2>
      <div className="sheet mb-8">
        <ul className="divide-y divide-[color:var(--rule-soft)]">
          {READY_ITEMS.map((item) => (
            <li key={item} className="px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.practice.doneTitle}
      </h2>
      <div className="sheet mb-8">
        <ul className="divide-y divide-[color:var(--rule-soft)]">
          {DONE_ITEMS.map((item) => (
            <li key={item} className="px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">
        {copy.practice.keelTitle}
      </h2>
      <p className="mb-4 max-w-[62ch] text-[color:var(--graphite)]">{copy.practice.keelLede}</p>
      <p className="font-data text-sm text-[color:var(--graphite)]">
        {fillCopy(copy.practice.keelNumbers, { fte: KEEL_SUMMARY.coreRoleMinFte, split })}
      </p>
    </>
  );
}
