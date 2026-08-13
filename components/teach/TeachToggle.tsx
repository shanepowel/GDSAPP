'use client';

import { useTeach } from '@/components/teach/TeachProvider';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export function TeachToggle() {
  const { explain, setExplain } = useTeach();
  const { locale } = useI18n();
  const copy = getCopy(locale);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={explain}
      className={`learn-toggle${explain ? ' on' : ''}`}
      onClick={() => setExplain(!explain)}
    >
      <span className="learn-switch" aria-hidden="true">
        <i />
      </span>
      {copy.teach.toggle}
    </button>
  );
}
