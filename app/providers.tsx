'use client';

import { SessionProvider } from 'next-auth/react';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { ThemeProvider } from '@/components/app/ThemeProvider';
import { TRPCProvider } from '@/lib/trpc/client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LocaleProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </LocaleProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
