'use client';

import { Card } from '@/components/app/Card';
import { useI18n } from '@/components/app/LocaleProvider';
import type { RequirementFlexResult } from '@/lib/engine/requirement-flex';

export function RequirementFlexCard({ flex }: { flex: RequirementFlexResult }) {
  const { messages: m } = useI18n();

  return (
    <Card className="p-5">
      <h2 className="font-semibold text-text">{m.engagement.flexTitle}</h2>
      <p className="mt-2 text-sm text-text-muted">{flex.summary}</p>
      <p className="mt-2 text-xs text-text-muted">
        {m.engagement.flexPriority}: <span className="font-medium text-text">{flex.priority}</span>
      </p>
      {flex.lockedConstraints.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-text-muted">
          {flex.lockedConstraints.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}
      {flex.options.length > 0 && (
        <ul className="mt-4 space-y-3">
          {flex.options.map((opt) => (
            <li key={opt.id} className="rounded-lg border border-border bg-surface-alt p-4 text-sm">
              <p className="font-medium text-text">{opt.title}</p>
              <p className="mt-1 text-text-muted">{opt.description}</p>
              <ul className="mt-2 list-disc pl-4 text-xs text-text-muted">
                {opt.tradeoffs.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {flex.options.length === 0 && (
        <p className="mt-3 text-sm text-brand-hover">{m.engagement.flexNoOptions}</p>
      )}
    </Card>
  );
}
