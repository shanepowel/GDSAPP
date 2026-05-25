'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cy } from '@/lib/i18n/cy';
import { en } from '@/lib/i18n/en';
import { getMessages, isLocale, LOCALE_COOKIE, type Locale } from '@/lib/i18n/index';
import type { Messages } from '@/lib/i18n/types';

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  messages: en,
  setLocale: () => {},
});

function readCookieLocale(): Locale {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
  const value = match?.[1];
  return value && isLocale(value) ? value : 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(readCookieLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.lang = next === 'cy' ? 'cy-GB' : 'en-GB';
  }, []);

  const value = useMemo(
    () => ({
      locale,
      messages: getMessages(locale),
      setLocale,
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  return useContext(LocaleContext);
}
