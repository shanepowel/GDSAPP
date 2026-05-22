'use client';

import Link from 'next/link';
import { Shield, Wrench } from 'lucide-react';
import { getClientDeploymentFeatures } from '@/lib/deployment-mode-client';

export function DeploymentBanner() {
  const features = getClientDeploymentFeatures();
  const client = features.mode === 'client';

  return (
    <div
      className={`mb-6 flex flex-wrap items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
        client ? 'border-accent bg-[color-mix(in_srgb,var(--color-accent)_8%,white)]' : 'border-brand bg-brand-tint'
      }`}
    >
      <div className="flex gap-3">
        {client ? (
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
        ) : (
          <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
        )}
        <div>
          <p className="font-semibold text-text">
            {client ? 'Client assurance instance (Play B)' : 'Internal delivery instance (Play A)'}
          </p>
          <p className="mt-1 text-text-muted">
            {client
              ? 'NRW-operated assurance across services and call-offs. This deployment must not receive supplier competitive submissions.'
              : 'Call-off and delivery accelerator for Amplified teams. Keep separate from any client-owned instance.'}
          </p>
        </div>
      </div>
      {features.handoverPack && client && (
        <Link
          href="/handover"
          className="shrink-0 text-sm font-medium text-brand-hover hover:underline"
        >
          Handover pack
        </Link>
      )}
    </div>
  );
}
