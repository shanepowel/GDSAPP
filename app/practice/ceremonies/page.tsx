'use client';

import { CeremoniesTable } from '@/components/practice/PracticeContent';
import { PageHeader } from '@/components/datum/PageChrome';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export default function CeremoniesPage() {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  return (
    <>
      <PageHeader
        eyebrow={copy.nav.practice.label}
        title={copy.practice.ceremoniesTitle}
        lede={copy.practice.ceremoniesLede}
      />
      <CeremoniesTable />
    </>
  );
}
