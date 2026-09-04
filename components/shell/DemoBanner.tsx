'use client';

import { useSession } from 'next-auth/react';
import { isDemoReaderRole } from '@/lib/demo/reader';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export function DemoBanner() {
  const { data } = useSession();
  const { locale } = useI18n();
  const copy = getCopy(locale);
  if (!isDemoReaderRole(data?.user?.role)) return null;
  return (
    <p className="demo-banner" role="status">
      {copy.demo.banner}
    </p>
  );
}
