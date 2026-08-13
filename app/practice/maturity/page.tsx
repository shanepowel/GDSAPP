'use client';

import { MaturityLadder } from '@/components/practice/PracticeContent';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export default function MaturityPage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  return (
    <>
      <p className="eyebrow mb-2 text-[color:var(--graphite)]">{copy.nav.practice.label}</p>
      <h1 className="font-[family-name:var(--font-cond)] text-[30px] font-bold">
        {copy.practice.maturityTitle}
      </h1>
      <div className="mt-6">
        <MaturityLadder current={2} />
      </div>
    </>
  );
}
