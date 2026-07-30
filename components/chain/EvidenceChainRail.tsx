'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import type { ChainSegmentState } from '@/lib/assurance/chain';

type ChainTarget = { engagementId: string; criterionId: string } | null;

type ChainContextValue = {
  open: (engagementId: string, criterionId: string) => void;
  close: () => void;
  target: ChainTarget;
};

const ChainContext = createContext<ChainContextValue | null>(null);

export function useEvidenceChain() {
  const ctx = useContext(ChainContext);
  if (!ctx) {
    return {
      open: (_e: string, _c: string) => undefined,
      close: () => undefined,
      target: null as ChainTarget,
    };
  }
  return ctx;
}

function connectorColor(state: ChainSegmentState): string {
  switch (state) {
    case 'complete':
      return 'var(--signal)';
    case 'unevidenced':
      return 'var(--rule)';
    case 'broken':
      return 'var(--rule)';
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function EvidenceChainPanel({
  engagementId,
  criterionId,
  onClose,
  returnFocusTo,
}: {
  engagementId: string;
  criterionId: string;
  onClose: () => void;
  returnFocusTo: HTMLElement | null;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = trpc.assurance.evidenceChain.useQuery({
    engagementId,
    criterionId,
  });

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    return () => {
      returnFocusTo?.focus();
    };
  }, [returnFocusTo]);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink-0/40 md:bg-transparent"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-full w-full max-w-[480px] flex-col border-l border-rule bg-stock-0 shadow-lg"
        style={{
          transition: reducedMotion ? undefined : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rule px-4 py-3">
          <h2 id={titleId} className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-0">
            Evidence chain
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="rounded-[2px] px-2 py-1 text-sm text-ink-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus)]"
            onClick={onClose}
            aria-label="Close evidence chain"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading && <p className="text-sm text-ink-2">Loading…</p>}
          {data && (
            <ol className="space-y-0">
              {data.segments.map((seg, i) => (
                <li key={seg.id} className="relative pl-6">
                  {i < data.segments.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[7px] top-4 bottom-0 w-0 border-l-2"
                      style={{
                        borderColor: connectorColor(seg.state),
                        borderStyle: seg.state === 'broken' ? 'dashed' : 'solid',
                      }}
                    />
                  )}
                  <span
                    aria-hidden
                    className="absolute left-0 top-1 text-[14px]"
                    style={{ color: connectorColor(seg.state) }}
                  >
                    ⬥
                  </span>
                  <div className="pb-5">
                    <p className="font-data text-[11px] uppercase tracking-[0.04em] text-ink-2">
                      {seg.title}
                    </p>
                    {seg.href ? (
                      <Link
                        href={seg.href}
                        className="mt-1 block whitespace-pre-line text-[15px] leading-[1.55] text-ink-0 underline-offset-2 hover:underline"
                        onClick={onClose}
                      >
                        {seg.body}
                      </Link>
                    ) : (
                      <p className="mt-1 whitespace-pre-line text-[15px] leading-[1.55] text-ink-1">
                        {seg.body}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

export function EvidenceChainProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<ChainTarget>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((engagementId: string, criterionId: string) => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setTarget({ engagementId, criterionId });
  }, []);

  const close = useCallback(() => setTarget(null), []);

  return (
    <ChainContext.Provider value={{ open, close, target }}>
      {children}
      {target && (
        <EvidenceChainPanel
          engagementId={target.engagementId}
          criterionId={target.criterionId}
          onClose={close}
          returnFocusTo={triggerRef.current}
        />
      )}
    </ChainContext.Provider>
  );
}
