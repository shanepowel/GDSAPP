import { PracticeOverview } from '@/components/practice/PracticeContent';
import { DatumAppShell } from '@/components/shell/AppShell';

export default function PracticeHome() {
  return (
    <DatumAppShell>
      <PracticeOverview />
    </DatumAppShell>
  );
}
