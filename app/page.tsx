import { HomeLanding } from '@/components/practice/HomeLanding';
import { DatumAppShell } from '@/components/shell/AppShell';

export default function HomePage() {
  return (
    <DatumAppShell showTour={false}>
      <HomeLanding />
    </DatumAppShell>
  );
}
