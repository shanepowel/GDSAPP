'use client';

import { SessionProvider } from 'next-auth/react';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { ThemeProvider } from '@/components/app/ThemeProvider';
import { TRPCProvider } from '@/lib/trpc/client';
import { TeachProvider } from '@/components/teach/TeachProvider';
import type { Locale } from '@/lib/i18n';

export function Providers({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LocaleProvider initialLocale={initialLocale}>
          <TeachProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </TeachProvider>
        </LocaleProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
