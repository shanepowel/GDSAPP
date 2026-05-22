'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { Card } from '@/components/app/Card';
import { DeploymentBanner } from '@/components/app/DeploymentBanner';
import { HANDOVER_SECTIONS } from '@/lib/handover/sections';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';

export default function HandoverPage() {
  const [active, setActive] = useState(HANDOVER_SECTIONS[0].id);
  const section = HANDOVER_SECTIONS.find((s) => s.id === active)!;
  const features = getClientDeploymentFeatures();

  return (
    <AppShell title="Handover and training pack" orgLabel="Play B · client-owned instance">
      <DeploymentBanner />
      <AppNav />

      {!features.clientAssuranceLabels && (
        <p className="mb-6 rounded-lg border border-border bg-surface-alt p-4 text-sm text-text-muted">
          You are on an <strong>internal</strong> deployment. Use this pack when delivering handover to
          NRW. Their production instance must use <code className="text-xs">DEPLOYMENT_MODE=client</code>.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {HANDOVER_SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                active === s.id ? 'bg-brand-tint font-medium text-brand-hover' : 'text-text-muted hover:bg-surface-alt'
              }`}
            >
              {s.title}
            </button>
          ))}
        </nav>
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold">{section.title}</h2>
          <div className="prose-handover mt-4 space-y-3 text-sm leading-relaxed text-text">
            {section.body.split('\n\n').map((para, i) => {
              if (para.startsWith('|')) {
                return (
                  <pre key={i} className="overflow-x-auto rounded bg-surface-alt p-3 text-xs">
                    {para}
                  </pre>
                );
              }
              const html = para
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<code class="rounded bg-surface-alt px-1 text-xs">$1</code>');
              return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
            })}
          </div>
        </Card>
      </div>

      <p className="mt-8 text-xs text-text-muted">
        Full markdown copies: docs/handover/ in the repository. Print this page for workshop use.
      </p>
    </AppShell>
  );
}
