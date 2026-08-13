'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { fillCopy } from '@/lib/copy';

const TOUR_DISMISS_KEY = 'datum-tour-dismissed';

export function TourBar({ engagementId }: { engagementId?: string }) {
  return (
    <Suspense fallback={null}>
      <TourBarInner engagementId={engagementId} />
    </Suspense>
  );
}

function tourIndexFromPath(pathname: string): number {
  if (pathname.startsWith('/roles')) return 2;
  if (pathname.startsWith('/people')) return 3;
  if (pathname.startsWith('/squads')) return 4;
  if (pathname.startsWith('/assurance')) return 7;
  return 0;
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
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(TOUR_DISMISS_KEY) === '1';
    setDismissed(tourParam ? false : stored);
  }, [tourParam]);

  const index = useMemo(() => {
    if (Number.isFinite(requested) && requested >= 1) {
      return Math.min(steps.length, Math.max(1, requested)) - 1;
    }
    return tourIndexFromPath(pathname);
  }, [pathname, requested, steps.length]);

  const hrefFor = useCallback(
    (stepIndex: number) => {
      const step = steps[stepIndex];
      const n = stepIndex + 1;
      if (step.view === 'practice' || step.view === 'practice-clocks') return `/?tour=${n}`;
      if (step.view === 'roles') return `/roles?tour=${n}`;
      if (step.view === 'people') return `/people?tour=${n}`;
      if (step.view === 'squads' || step.view === 'squads-weak' || step.view === 'squads-unevidenced') {
        const base = engagementId ? `/squads/${engagementId}` : '/squads';
        return `${base}?tour=${n}`;
      }
      if (step.view === 'assurance') {
        const base = engagementId ? `/assurance/${engagementId}` : '/assurance';
        return `${base}?tour=${n}`;
      }
      return `/portfolio?tour=${n}`;
    },
    [engagementId, steps],
  );

  const go = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, nextIndex));
    router.push(hrefFor(clamped));
  };

  if (dismissed === null || dismissed) return null;

  const stepLabel = fillCopy(c.tour.step, { current: index + 1, total: steps.length });

  return (
    <div className="tour-bar no-print" role="region" aria-label={c.tour.region}>
      <div className="tour-step font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] opacity-65">
        {stepLabel}
      </div>
      <p className="tour-text flex-1 text-[13px]">{steps[index].text}</p>
      <button
        type="button"
        className="btn-teach"
        onClick={() => go(index - 1)}
        disabled={index === 0}
      >
        {c.tour.back}
      </button>
      <button
        type="button"
        className="btn-teach pri"
        onClick={() => go(index + 1)}
        disabled={index === steps.length - 1}
      >
        {c.tour.next}
      </button>
      <button
        type="button"
        className="btn-teach ghost"
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
