'use client';

import { MaturityLadder } from '@/components/practice/PracticeContent';
import { PageHeader } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export default function MaturityPage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  return (
    <>
      <PageHeader eyebrow={copy.nav.practice.label} title={copy.practice.maturityTitle} />
      <MaturityLadder current={2} />
    </>
  );
}
