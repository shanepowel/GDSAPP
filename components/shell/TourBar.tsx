'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

const TOUR_DISMISS_KEY = 'datum-tour-dismissed';

export function TourBar({ engagementId }: { engagementId?: string }) {
  return (
    <Suspense fallback={null}>
      <TourBarInner engagementId={engagementId} />
    </Suspense>
  );
}

function TourBarInner({ engagementId }: { engagementId?: string }) {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useI18n();
  const c = getCopy(locale);
  const steps = c.tour.steps;

  const tourParam = search.get('tour');
  const requested = tourParam ? Number.parseInt(tourParam, 10) : NaN;
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(TOUR_DISMISS_KEY);
    setDismissed(stored === '1' && !tourParam);
  }, [tourParam]);

  const index = useMemo(() => {
    if (!Number.isFinite(requested) || requested < 1) return 0;
    return Math.min(steps.length, Math.max(1, requested)) - 1;
  }, [requested, steps.length]);

  const visible = Boolean(tourParam) && !dismissed;

  const hrefFor = useCallback(
    (stepIndex: number) => {
      const step = steps[stepIndex];
      if (step.view === 'practice') return `/?tour=${stepIndex + 1}`;
      if (step.view === 'people') return `/people?tour=${stepIndex + 1}`;
      if (step.view === 'squads' || step.view === 'squads-reason') {
        const base = engagementId ? `/squads/${engagementId}` : '/squads';
        return `${base}?tour=${stepIndex + 1}`;
      }
      if (step.view === 'assurance') {
        const base = engagementId ? `/assurance/${engagementId}` : '/assurance';
        return `${base}?tour=${stepIndex + 1}`;
      }
      return `/portfolio?tour=${stepIndex + 1}`;
    },
    [engagementId, steps],
  );

  const go = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, nextIndex));
    router.push(hrefFor(clamped));
  };

  if (!visible) return null;

  const stepLabel = c.tour.step
    .replace('{current}', String(index + 1))
    .replace('{total}', String(steps.length));

  return (
    <div className="tour-bar no-print" role="region" aria-label="Guided walk">
      <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] opacity-65">
        {stepLabel}
      </div>
      <p className="flex-1 text-[13px]">{steps[index].text}</p>
      <button
        type="button"
        className="rounded-[var(--radius)] border border-[color:color-mix(in_srgb,var(--stock)_40%,transparent)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.1em]"
        onClick={() => go(index - 1)}
        disabled={index === 0}
      >
        {c.tour.back}
      </button>
      <button
        type="button"
        className="rounded-[var(--radius)] bg-[var(--survey)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.1em] text-[var(--stock)]"
        onClick={() => go(index + 1)}
        disabled={index === steps.length - 1}
      >
        {c.tour.next}
      </button>
      <button
        type="button"
        className="font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-[0.1em] opacity-60"
        onClick={() => {
          window.sessionStorage.setItem(TOUR_DISMISS_KEY, '1');
          setDismissed(true);
          const params = new URLSearchParams(search.toString());
          params.delete('tour');
          const q = params.toString();
          router.replace(q ? `${pathname}?${q}` : pathname);
        }}
      >
        {c.tour.dismiss}
      </button>
    </div>
  );
}
