import type { Metadata } from 'next';
import { Catalogue } from '@/components/library/Catalogue';

export const metadata: Metadata = {
  title: 'Component library',
  description:
    'Sizing, standard controls, and the implementation guide for Assemble, written to the Government Digital Service design principles.',
};

export default function ComponentsPage() {
  return <Catalogue />;
}
