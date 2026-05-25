'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { Card } from '@/components/app/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/app/LocaleProvider';
import { useTheme } from '@/components/app/ThemeProvider';
import { trpc } from '@/lib/trpc/client';

const inputClass =
  'mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text';

type ProfileData = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  organisationName: string;
};

function ProfileForm({
  data,
  onSaved,
}: {
  data: ProfileData;
  onSaved: () => void;
}) {
  const { messages: m } = useI18n();
  const [name, setName] = useState(data.name ?? '');
  const [email, setEmail] = useState(data.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const update = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      setMessage(m.profile.saved);
      setError('');
      setCurrentPassword('');
      setNewPassword('');
      onSaved();
    },
    onError: (err) => {
      setError(err.message);
      setMessage('');
    },
  });

  return (
    <form
      className="max-w-lg space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        update.mutate({
          name,
          email,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword || undefined,
        });
      }}
    >
      <div>
        <label className="text-sm font-medium text-text">{m.profile.name}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-text">{m.profile.email}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
        />
      </div>
      <div>
        <p className="text-sm font-medium text-text">{m.profile.organisation}</p>
        <p className="mt-1 text-sm text-text-muted">{data.organisationName}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-text">{m.profile.role}</p>
        <p className="mt-1 text-sm capitalize text-text-muted">{data.role}</p>
      </div>

      <hr className="border-border" />

      <p className="text-sm text-text-muted">{m.profile.passwordHint}</p>
      <div>
        <label className="text-sm font-medium text-text">{m.profile.currentPassword}</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={inputClass}
          autoComplete="current-password"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-text">{m.profile.newPassword}</label>
        <input
          type="password"
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputClass}
          autoComplete="new-password"
        />
      </div>

      {message && <p className="text-sm text-brand-hover">{message}</p>}
      {error && <p className="text-sm text-status-gap">{error}</p>}

      <Button type="submit" disabled={update.isPending}>
        {update.isPending ? m.common.loading : m.common.save}
      </Button>
    </form>
  );
}

export default function ProfilePage() {
  const { messages: m } = useI18n();
  const { theme, toggle } = useTheme();
  const { data, isLoading, refetch } = trpc.user.me.useQuery();

  return (
    <AppShell title={m.profile.title} hideTitle>
      <AppNav />
      <p className="mb-8 text-sm text-text-muted">{m.profile.subtitle}</p>

      {isLoading && <p className="text-text-muted">{m.common.loading}</p>}

      {data && (
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <Card className="p-6">
            <ProfileForm key={data.id} data={data} onSaved={() => refetch()} />
          </Card>

          <Card className="flex h-fit flex-col gap-4 p-6">
            <h2 className="font-semibold text-text">Account</h2>
            <p className="text-sm text-text-muted">
              Signed in as <span className="font-medium text-text">{data.email}</span>
            </p>
            <Button variant="secondary" onClick={() => signOut({ callbackUrl: '/' })}>
              {m.profile.signOut}
            </Button>
            <Button variant="secondary" type="button" onClick={toggle}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </Button>
            <Link href="/settings" className="text-sm text-brand hover:underline">
              Organisation settings
            </Link>
            <Link href="/engagements" className="text-sm text-brand hover:underline">
              ← {m.nav.engagements}
            </Link>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
