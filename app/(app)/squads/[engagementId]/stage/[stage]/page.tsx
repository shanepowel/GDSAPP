'use client';

import { useParams } from 'next/navigation';
import { SpineFrame, StageScreen } from '@/components/engagement/screens';
import { LIFECYCLE_STAGES, type LifecycleStage } from '@/lib/attention/lifecycle';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { Text } from '@/components/library/type';

function isStage(value: string): value is LifecycleStage {
  return (LIFECYCLE_STAGES as readonly string[]).includes(value);
}

export default function StagePage() {
  const params = useParams();
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const id = String(params.engagementId);
  const stage = String(params.stage);
  if (!isStage(stage)) return <Text>{copy.ui.loadFailed}</Text>;
  return (
    <SpineFrame id={id}>
      <StageScreen id={id} stage={stage} />
    </SpineFrame>
  );
}
