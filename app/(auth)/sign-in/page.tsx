'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/app/LocaleProvider';

export default function SignInPage() {
  const { messages: m } = useI18n();
  const [email, setEmail] = useState('admin@demo.local');
  const [password, setPassword] = useState('demo-password');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }
    window.location.href = '/engagements';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-md">
        <p className="text-sm font-medium text-brand">Amplified Ltd</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-text">{m.signIn.title}</h1>
        <p className="mt-2 text-sm text-text-muted">
          Assess team readiness against GDS or Wales digital service standards.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-text">
              {m.signIn.email}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-text">
              {m.signIn.password}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-status-gap">{error}</p>}
          <Button type="submit" className="w-full">
            {m.signIn.submit}
          </Button>
        </form>
      </div>
    </div>
  );
}
