'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthTabs } from '@/components/auth/AuthTabs';

function SignInContent() {
  const params = useSearchParams();
  const initialTab = params.get('tab') === 'register' ? 'register' : 'sign-in';
  return <AuthTabs key={initialTab} initialTab={initialTab} />;
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
