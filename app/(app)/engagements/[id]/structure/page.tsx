import { redirect } from 'next/navigation';

/** Legacy path — Organise is the plate destination. */
export default async function StructureRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/engagements/${id}/organise`);
}
