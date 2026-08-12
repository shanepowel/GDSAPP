import { EngagementPlate } from '@/components/product/EngagementPlate';

export default async function EngagementLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EngagementPlate engagementId={id}>{children}</EngagementPlate>;
}
