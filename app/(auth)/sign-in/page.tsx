'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthTabs } from '@/components/auth/AuthTabs';

function SignInContent() {
  const params = useSearchParams();
  const initialTab = params.get('tab') === 'register' ? 'register' : 'sign-in';
  const rawCallback = params.get('callbackUrl');
  const callbackUrl =
    rawCallback && rawCallback.startsWith('/') && !rawCallback.startsWith('//')
      ? rawCallback
      : '/engagements';
  return (
    <AuthTabs key={`${initialTab}-${callbackUrl}`} initialTab={initialTab} callbackUrl={callbackUrl} />
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg text-text-muted">
          Loading…
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
