'use client';

import { PillarsTable } from '@/components/practice/PracticeContent';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export default function PillarsPage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  return (
    <>
      <p className="eyebrow mb-2 text-[color:var(--graphite)]">{copy.nav.practice.label}</p>
      <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold">{copy.practice.pillarsTitle}</h1>
      <p className="mt-2 mb-6 max-w-[62ch] text-[color:var(--graphite)]">{copy.practice.pillarsLede}</p>
      <PillarsTable />
    </>
  );
}
