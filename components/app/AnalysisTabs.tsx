'use client';

import type { LucideIcon } from 'lucide-react';
import {
  ClipboardCheck,
  GitBranch,
  Scale,
  Sparkles,
  Users,
} from 'lucide-react';

export type AnalysisTabId = 'fit' | 'composition' | 'readiness' | 'adaptation' | 'bid';

const TABS: { id: AnalysisTabId; label: string; Icon: LucideIcon }[] = [
  { id: 'fit', label: 'Fit', Icon: Users },
  { id: 'composition', label: 'Composition', Icon: GitBranch },
  { id: 'readiness', label: 'Readiness', Icon: ClipboardCheck },
  { id: 'adaptation', label: 'Adaptation', Icon: Sparkles },
  { id: 'bid', label: 'Bid', Icon: Scale },
];

export function AnalysisTabs({
  active,
  onChange,
  showBid,
}: {
  active: AnalysisTabId;
  onChange: (id: AnalysisTabId) => void;
  showBid?: boolean;
}) {
  const tabs = showBid ? TABS : TABS.filter((t) => t.id !== 'bid');

  return (
    <div className="mb-6 flex gap-1 border-b border-border">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="-mb-px flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
            style={{
              color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
              borderBottom: isActive ? '2px solid var(--color-brand)' : '2px solid transparent',
            }}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
