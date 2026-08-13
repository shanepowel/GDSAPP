'use client';

import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { DONE_ITEMS, KEEL_SUMMARY, READY_ITEMS } from '@/lib/practice';

export default function StandardsPage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  return (
    <>
      <p className="eyebrow mb-2 text-[color:var(--graphite)]">{copy.nav.practice.label}</p>
      <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold">
        {copy.practice.standardsTitle}
      </h1>
      <p className="mt-2 mb-6 max-w-[62ch] text-[color:var(--graphite)]">{copy.practice.standardsLede}</p>

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">Definition of ready</h2>
      <div className="sheet mb-8">
        <ul className="divide-y divide-[color:var(--rule-soft)]">
          {READY_ITEMS.map((item) => (
            <li key={item} className="px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">Definition of done</h2>
      <div className="sheet mb-8">
        <ul className="divide-y divide-[color:var(--rule-soft)]">
          {DONE_ITEMS.map((item) => (
            <li key={item} className="px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mb-3 font-[family-name:var(--font-cond)] text-[17px] font-semibold">{copy.practice.keelTitle}</h2>
      <p className="mb-4 max-w-[62ch] text-[color:var(--graphite)]">{copy.practice.keelLede}</p>
      <p className="font-data text-sm text-[color:var(--graphite)]">
        Core role minimum {KEEL_SUMMARY.coreRoleMinFte} FTE · capacity{' '}
        {KEEL_SUMMARY.capacitySplit.committed * 100}/{KEEL_SUMMARY.capacitySplit.discretionary * 100}/
        {KEEL_SUMMARY.capacitySplit.slack * 100}
      </p>
    </>
  );
}
