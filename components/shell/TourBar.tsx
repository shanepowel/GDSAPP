'use client';

import { Suspense, useSyncExternalStore } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';
import { fillCopy } from '@/lib/copy';

const TOUR_DISMISS_KEY = 'datum-tour-dismissed';
const TOUR_STEP_KEY = 'datum-tour-step';
const TOUR_EVENT = 'datum-tour-change';

function subscribeTour(onChange: () => void) {
  window.addEventListener(TOUR_EVENT, onChange);
  return () => window.removeEventListener(TOUR_EVENT, onChange);
}

const SERVER_TOUR = { dismissed: true, step: Number.NaN };
let tourSnapshot = SERVER_TOUR;

function readTourState() {
  const next = {
    dismissed: window.sessionStorage.getItem(TOUR_DISMISS_KEY) === '1',
    step: Number.parseInt(window.sessionStorage.getItem(TOUR_STEP_KEY) ?? '', 10),
  };
  if (next.dismissed === tourSnapshot.dismissed && Object.is(next.step, tourSnapshot.step)) return tourSnapshot;
  tourSnapshot = next;
  return tourSnapshot;
}

function writeStep(step: number) {
  window.sessionStorage.setItem(TOUR_STEP_KEY, String(step));
  window.sessionStorage.removeItem(TOUR_DISMISS_KEY);
  window.dispatchEvent(new Event(TOUR_EVENT));
}

function dismissTour() {
  window.sessionStorage.setItem(TOUR_DISMISS_KEY, '1');
  window.dispatchEvent(new Event(TOUR_EVENT));
}

function pageForView(pathname: string, view: string | undefined): boolean {
  if (view === 'practice' || view === 'practice-clocks') return pathname === '/';
  if (view === 'roles') return pathname.startsWith('/roles');
  if (view === 'people') return pathname.startsWith('/people');
  if (view === 'squads' || view === 'squads-weak' || view === 'squads-unevidenced') return pathname.startsWith('/squads');
  if (view === 'assurance') return pathname.startsWith('/assurance');
  return pathname.startsWith('/portfolio');
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
  const stored = useSyncExternalStore(subscribeTour, readTourState, () => SERVER_TOUR);
  const tourParam = search.get('tour');
  const requested = tourParam ? Number.parseInt(tourParam, 10) : Number.NaN;
  const fromParam = Number.isFinite(requested) && requested >= 1 ? Math.min(steps.length, Math.max(1, requested)) : null;
  const index = (fromParam ?? (Number.isFinite(stored.step) ? stored.step : null)) ? (fromParam ?? stored.step) - 1 : null;
  const step = index != null ? steps[index] : undefined;
  const visible = Boolean(step) && (fromParam != null || !stored.dismissed) && pageForView(pathname, step?.view);

  if (!visible || index == null || !step) return null;

  const stepLabel = fillCopy(c.tour.step, { current: index + 1, total: steps.length });
  const last = index === steps.length - 1;

  function go(nextIndex: number) {
    const clamped = Math.max(0, Math.min(steps.length - 1, nextIndex));
    writeStep(clamped + 1);
    router.push(hrefForStep(clamped, engagementId, steps[clamped]?.view));
  }

  function finish() {
    dismissTour();
    const params = new URLSearchParams(search.toString());
    params.delete('tour');
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <div className="tour-bar no-print" role="region" aria-label={c.tour.region}>
      <div className="tour-step font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] opacity-65">
        {stepLabel}
      </div>
      <p className="tour-text flex-1 text-[13px]">{step.text}</p>
      <button type="button" className="btn-teach" onClick={() => go(index - 1)} disabled={index === 0}>
        {c.tour.back}
      </button>
      {last ? (
        <button type="button" className="btn-teach pri" onClick={finish}>
          {c.tour.finish}
        </button>
      ) : (
        <button type="button" className="btn-teach pri" onClick={() => go(index + 1)}>
          {c.tour.next}
        </button>
      )}
      <button type="button" className="btn-teach ghost" onClick={finish}>
        {c.tour.dismiss}
      </button>
    </div>
  );
}
