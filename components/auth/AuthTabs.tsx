'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher';
import { BrandMark } from '@/components/brand/BrandMark';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

type Tab = 'sign-in' | 'register';

const inputClass =
  'mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text';

export function AuthTabs({
  initialTab = 'sign-in',
  callbackUrl = '/engagements',
}: {
  initialTab?: Tab;
  callbackUrl?: string;
}) {
  const { messages: m } = useI18n();
  const { data: authConfig } = trpc.user.authConfig.useQuery();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [redirectAfterSignIn, setRedirectAfterSignIn] = useState(callbackUrl);

  useEffect(() => {
    setRedirectAfterSignIn(callbackUrl);
  }, [callbackUrl]);

  const entraEnabled = authConfig?.entraEnabled ?? false;
  const allowRegister = authConfig?.allowRegister ?? true;
  const singleLogin = authConfig?.singleLoginService ?? false;
  const unified = authConfig?.mode === 'unified';

  const register = trpc.user.register.useMutation({
    onSuccess: () => {
      setSuccess(m.signIn.accountCreated);
      setTab('sign-in');
      setError('');
      setPassword('');
    },
    onError: (err) => {
      setError(err.message);
      setSuccess('');
    },
  });

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    if (res?.error) {
      if (authConfig?.schemaReady === false) {
        setError(m.signIn.databaseNotReady);
      } else {
        setError(entraEnabled ? m.signIn.invalidCredentialsOrSso : m.signIn.invalidCredentials);
      }
      return;
    }
    window.location.href = redirectAfterSignIn;
  }

  function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    register.mutate({ name, email, password, organisationName });
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-container items-center justify-between">
          <BrandMark href="/" variant="light" />
          <LanguageSwitcher />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-md">
          <h1 className="font-display text-2xl font-bold text-text">{m.signIn.title}</h1>
          {singleLogin && (
            <p className="mt-2 text-sm text-text-muted">{m.signIn.singleLoginHint}</p>
          )}

          {allowRegister && (
            <div
              className="mt-6 flex rounded-lg border border-border p-1"
              role="tablist"
              aria-label="Account access"
            >
              {(['sign-in', 'register'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => {
                    setTab(key);
                    setError('');
                  }}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    tab === key
                      ? 'bg-brand text-text-inverse'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {key === 'sign-in' ? m.signIn.tabSignIn : m.signIn.tabRegister}
                </button>
              ))}
            </div>
          )}

          {success && (
            <p className="mt-4 rounded-md bg-brand-tint px-3 py-2 text-sm text-brand-hover">
              {success}
            </p>
          )}
          {authConfig?.schemaReady === false && (
            <p className="mt-4 rounded-md border border-status-partial/40 bg-status-partial/10 px-3 py-2 text-sm text-text">
              {m.signIn.databaseNotReady}
            </p>
          )}
          {error && <p className="mt-4 text-sm text-status-gap">{error}</p>}

          <div className="mt-4 rounded-lg border border-brand/25 bg-brand-tint px-4 py-3 text-sm">
            <p className="font-medium text-text">{m.signIn.demoHint}</p>
            <p className="mt-2 font-mono text-xs text-text-muted">
              {m.signIn.demoEmail} / {m.signIn.demoPassword}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => {
                setEmail(m.signIn.demoEmail);
                setPassword(m.signIn.demoPassword);
                setShowEmailLogin(true);
                setRedirectAfterSignIn('/engagements/nrw-demo');
              }}
            >
              {m.home.ctaDemoEngagement}
            </Button>
          </div>

          {tab === 'sign-in' || !allowRegister ? (
            <div className="mt-6 space-y-4">
              {entraEnabled && (
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => signIn('azure-ad', { callbackUrl: '/engagements' })}
                >
                  {m.signIn.entraSignIn}
                </Button>
              )}

              {unified && !showEmailLogin && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowEmailLogin(true)}
                >
                  {m.signIn.emailSignIn}
                </Button>
              )}

              {(!entraEnabled || showEmailLogin || !unified) && (
                <form onSubmit={onSignIn} className="space-y-4">
                  {entraEnabled && unified && (
                    <p className="text-center text-xs text-text-muted">{m.signIn.orDivider}</p>
                  )}
                  {!singleLogin && (
                    <p className="text-sm text-text-muted">{m.signIn.signInHint}</p>
                  )}
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-text">
                      {m.signIn.email}
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
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
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {m.signIn.submit}
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={onRegister} className="mt-6 space-y-4">
              <p className="text-sm text-text-muted">{m.signIn.registerHint}</p>
              <div>
                <label htmlFor="name" className="text-sm font-medium text-text">
                  {m.signIn.name}
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="org" className="text-sm font-medium text-text">
                  {m.signIn.organisation}
                </label>
                <input
                  id="org"
                  type="text"
                  required
                  value={organisationName}
                  onChange={(e) => setOrganisationName(e.target.value)}
                  className={inputClass}
                  autoComplete="organization"
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="text-sm font-medium text-text">
                  {m.signIn.email}
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="text-sm font-medium text-text">
                  {m.signIn.password}
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={register.isPending}>
                {register.isPending ? m.common.loading : m.signIn.createAccount}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-text-muted">
            <Link href="/" className="text-brand hover:underline">
              ← {m.common.back}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
