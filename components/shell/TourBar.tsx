'use client';

import { Suspense, useSyncExternalStore } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { fillCopy } from '@/lib/copy';

const TOUR_DISMISS_KEY = 'datum-tour-dismissed';
const TOUR_DISMISS_EVENT = 'datum-tour-dismiss';

function subscribeTourDismiss(onChange: () => void) {
  window.addEventListener(TOUR_DISMISS_EVENT, onChange);
  return () => window.removeEventListener(TOUR_DISMISS_EVENT, onChange);
}

function tourIsDismissed() {
  return window.sessionStorage.getItem(TOUR_DISMISS_KEY) === '1';
}

function dismissTour() {
  window.sessionStorage.setItem(TOUR_DISMISS_KEY, '1');
  window.dispatchEvent(new Event(TOUR_DISMISS_EVENT));
}

function tourIndexFromPath(pathname: string): number {
  if (pathname.startsWith('/roles')) return 2;
  if (pathname.startsWith('/people')) return 3;
  if (pathname.startsWith('/squads')) return 4;
  if (pathname.startsWith('/assurance')) return 7;
  return 0;
}

function hrefForStep(stepIndex: number, engagementId: string | undefined, view: string | undefined): string {
  const n = stepIndex + 1;
  if (view === 'practice' || view === 'practice-clocks') return `/?tour=${n}`;
  if (view === 'roles') return `/roles?tour=${n}`;
  if (view === 'people') return `/people?tour=${n}`;
  if (view === 'squads' || view === 'squads-weak' || view === 'squads-unevidenced') {
    const base = engagementId ? `/squads/${engagementId}` : '/squads';
    return `${base}?tour=${n}`;
  }
  if (view === 'assurance') {
    const base = engagementId ? `/assurance/${engagementId}` : '/assurance';
    return `${base}?tour=${n}`;
  }
  return `/portfolio?tour=${n}`;
}

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
  const storedDismissed = useSyncExternalStore(subscribeTourDismiss, tourIsDismissed, () => true);
  const visible = Boolean(tourParam) || !storedDismissed;

  const requested = tourParam ? Number.parseInt(tourParam, 10) : Number.NaN;
  const index =
    Number.isFinite(requested) && requested >= 1
      ? Math.min(steps.length, Math.max(1, requested)) - 1
      : tourIndexFromPath(pathname);

  if (!visible) return null;

  const stepLabel = fillCopy(c.tour.step, { current: index + 1, total: steps.length });

  function go(nextIndex: number) {
    const clamped = Math.max(0, Math.min(steps.length - 1, nextIndex));
    router.push(hrefForStep(clamped, engagementId, steps[clamped]?.view));
  }

  return (
    <div className="tour-bar no-print" role="region" aria-label={c.tour.region}>
      <div className="tour-step font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] opacity-65">
        {stepLabel}
      </div>
      <p className="tour-text flex-1 text-[13px]">{steps[index].text}</p>
      <button type="button" className="btn-teach" onClick={() => go(index - 1)} disabled={index === 0}>
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
          dismissTour();
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
