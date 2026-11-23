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
import { useRouter } from 'next/navigation';
import { en } from '@/lib/i18n/en';
import { getMessages, isLocale, LOCALE_COOKIE, type Locale } from '@/lib/i18n/index';
import type { Messages } from '@/lib/i18n/types';
import { product } from '@/lib/product.config';

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

/** Keep the browser's own view of the page (language, tab title, description) in step. */
function applyToDocument(next: Locale) {
  document.documentElement.lang = next === 'cy' ? 'cy-GB' : 'en-GB';
  const welsh = next === 'cy';
  const thesis = welsh ? product.thesisCy : product.thesis;
  if (document.title.startsWith(`${product.name}: `) && (document.title.includes(product.thesis) || document.title.includes(product.thesisCy))) {
    document.title = `${product.name}: ${thesis}`;
  }
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', welsh ? product.metaDescriptionCy : product.metaDescription);
}

export function LocaleProvider({
  children,
  initialLocale = 'en',
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
      applyToDocument(next);
      // Server-rendered text and metadata pick up the new language too.
      router.refresh();
    },
    [router],
  );

  // On demand: any page opened with ?lang=cy or ?lang=en switches language, then tidies the address.
  useEffect(() => {
    const url = new URL(window.location.href);
    const asked = url.searchParams.get('lang');
    if (!asked || !isLocale(asked)) return;
    url.searchParams.delete('lang');
    const clean = `${url.pathname}${url.search}${url.hash}`;
    queueMicrotask(() => {
      if (asked !== locale) {
        setLocaleState(asked);
        document.cookie = `${LOCALE_COOKIE}=${asked};path=/;max-age=31536000;SameSite=Lax`;
        applyToDocument(asked);
      }
      // Replacing the address re-renders server text with the new language and drops ?lang.
      router.replace(clean, { scroll: false });
    });
    // Run once on first load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
