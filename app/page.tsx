import { PracticeOverview } from '@/components/practice/PracticeContent';
import { DatumAppShell } from '@/components/shell/AppShell';
import { copy } from '@/lib/copy';

export default function PracticeHome() {
  return (
    <DatumAppShell>
      <PracticeOverview />
      <footer className="mt-8 border-t border-[color:var(--rule)] py-8 font-[family-name:var(--font-mono)] text-[10px] leading-relaxed text-[color:var(--graphite)]">
        {copy.footer.disclaimer}
      </footer>
    </DatumAppShell>
  );
}
