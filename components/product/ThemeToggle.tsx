'use client';

import { useTheme } from '@/components/app/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-[2px] border border-rule bg-stock-0 px-2 py-1 font-data text-[11px] uppercase tracking-[0.04em] text-ink-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus)]"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
