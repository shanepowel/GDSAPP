import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { HomePage } from '@/components/marketing/HomePage';

export default async function Home() {
  const session = await getServerSession(authOptions);
  return <HomePage isSignedIn={Boolean(session?.user)} />;
}
