'use client';

import { SessionProvider } from 'next-auth/react';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { TRPCProvider } from '@/lib/trpc/client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <TRPCProvider>{children}</TRPCProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
