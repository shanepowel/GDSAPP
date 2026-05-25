'use client';

import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { Card } from '@/components/app/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/app/ThemeProvider';
import { useI18n } from '@/components/app/LocaleProvider';
import { trpc } from '@/lib/trpc/client';

export default function SettingsPage() {
  const { messages: m } = useI18n();
  const { theme, toggle } = useTheme();
  const { data: me } = trpc.user.me.useQuery();
  const { data: members, refetch } = trpc.user.listMembers.useQuery();
  const invite = trpc.user.inviteMember.useMutation({ onSuccess: () => refetch() });

  const isAdmin = me?.role === 'admin';

  return (
    <AppShell title={m.settings.title}>
      <AppNav />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold text-text">Appearance</h2>
          <p className="mt-2 text-sm text-text-muted">
            Dark theme reduces glare for long assurance sessions.
          </p>
          <Button className="mt-4" variant="secondary" type="button" onClick={toggle}>
            {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-text">Organisation</h2>
          <p className="mt-2 text-sm text-text-muted">{me?.organisationName}</p>
          <p className="mt-1 text-xs text-text-muted">Your role: {me?.role}</p>
          {me && (
            <p className="mt-3 text-sm">
              {m.settings.tenantMode}:{' '}
              <span className="font-medium">{me.instanceDeploymentMode}</span>
              {' · '}
              {me.tenantMatchesInstance ? (
                <span className="text-brand-hover">{m.settings.tenantMatch}</span>
              ) : (
                <span className="text-status-gap">{m.settings.tenantMismatch}</span>
              )}
            </p>
          )}
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold text-text">Team members</h2>
          <ul className="mt-4 divide-y divide-border">
            {members?.map((u) => (
              <li key={u.id} className="flex justify-between py-3 text-sm">
                <span>
                  <span className="font-medium text-text">{u.name ?? u.email}</span>
                  <span className="ml-2 text-text-muted">{u.email}</span>
                </span>
                <span className="capitalize text-text-muted">{u.role}</span>
              </li>
            ))}
          </ul>

          {isAdmin && (
            <form
              className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                invite.mutate({
                  name: String(fd.get('name')),
                  email: String(fd.get('email')),
                  password: String(fd.get('password')),
                  role: (fd.get('role') as 'admin' | 'member') || 'member',
                });
                e.currentTarget.reset();
              }}
            >
              <h3 className="font-medium text-text sm:col-span-2">Invite colleague</h3>
              <input
                name="name"
                required
                placeholder="Name"
                className="rounded-md border border-border px-3 py-2 text-sm"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="rounded-md border border-border px-3 py-2 text-sm"
              />
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Temporary password"
                className="rounded-md border border-border px-3 py-2 text-sm"
              />
              <select
                name="role"
                className="rounded-md border border-border px-3 py-2 text-sm"
                defaultValue="member"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="submit" disabled={invite.isPending} className="sm:col-span-2">
                Create account for colleague
              </Button>
              <p className="text-xs text-text-muted sm:col-span-2">
                Share the temporary password securely; they can change it in Profile.
              </p>
            </form>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
