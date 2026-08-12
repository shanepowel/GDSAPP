import { redirect } from 'next/navigation';

/** Spec route: Activity → existing history trail. */
export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/engagements/${id}/history`);
}
