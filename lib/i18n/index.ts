import { en } from '@/lib/i18n/en';
import { cy } from '@/lib/i18n/cy';
import type { Locale, Messages } from '@/lib/i18n/types';

export type { Locale, Messages } from '@/lib/i18n/types';

const catalogs: Record<Locale, Messages> = { en, cy };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? en;
}

export function isLocale(value: string): value is Locale {
  return value === 'en' || value === 'cy';
}

export const LOCALE_COOKIE = 'assemble-locale';

export const htmlLang: Record<Locale, string> = {
  en: 'en-GB',
  cy: 'cy-GB',
};
