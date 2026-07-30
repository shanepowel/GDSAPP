import { redirect } from 'next/navigation';

/** Spec route: Organise → existing structure workspace. */
export default async function OrganisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/engagements/${id}/structure`);
}
