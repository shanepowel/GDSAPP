'use client';

import { PageHeader } from '@/components/datum/PageChrome';
import { TeachPanel } from '@/components/teach/TeachPanel';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export function AssuranceTeaching() {
  const { locale } = useI18n();
  const copy = getCopy(locale);

  return (
    <>
      <PageHeader eyebrow={copy.assurance.eyebrow} title={copy.assurance.title} lede={copy.assurance.lede} />
      <TeachPanel tag={copy.teach.assessment.tag} title={copy.teach.assessment.title}>
        {copy.teach.assessment.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </TeachPanel>
    </>
  );
}
