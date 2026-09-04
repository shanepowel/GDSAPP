'use client';

import type { BridgeMapping } from '@/lib/bridge/gds';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { useI18n } from '@/components/app/LocaleProvider';

export function GdsBridgeLabel({ mapping }: { mapping: BridgeMapping | null | undefined }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  if (!mapping || mapping.gdsPoints.length === 0) return null;
  const label = fillCopy(copy.ui.gdsBridge, { points: mapping.gdsPoints.join(', ') });
  const title = `${mapping.ddat}. ${mapping.panelWouldAsk}`;
  return (
    <span className="gds-bridge" title={title}>
      {label}
    </span>
  );
}
