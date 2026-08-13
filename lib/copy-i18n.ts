import { copy, type Copy } from '@/lib/copy';
import { copyCy } from '@/lib/copy.cy';
import type { Locale } from '@/lib/i18n/types';

export function getCopy(locale: Locale): Copy {
  return locale === 'cy' ? copyCy : copy;
}
