import { AuthTabs } from '@/components/auth/AuthTabs';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; tab?: string; error?: string }>;
}) {
  const params = await searchParams;
  const initialTab = params.tab === 'register' ? 'register' : 'sign-in';
  const rawCallback = params.callbackUrl;
  const callbackUrl =
    rawCallback && rawCallback.startsWith('/') && !rawCallback.startsWith('//')
      ? rawCallback
      : '/squads';
  return (
    <AuthTabs initialTab={initialTab} callbackUrl={callbackUrl} sessionError={params.error} />
  );
}
