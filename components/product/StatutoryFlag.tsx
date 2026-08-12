'use client';

/** Statutory gaps are a different category of risk — not an amber verdict. */
export function StatutoryFlag() {
  return (
    <span className="font-data inline-block border border-verdict-not-met bg-verdict-not-met-wash px-2 py-0.5 text-[11px] uppercase tracking-[0.04em] text-verdict-not-met">
      Statutory
    </span>
  );
}
