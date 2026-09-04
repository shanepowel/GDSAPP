'use client';

import { useTheme } from '@/components/app/ThemeProvider';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const label = theme === 'dark' ? copy.ui.light : copy.ui.dark;

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-[2px] border border-rule bg-stock-0 px-2 py-1 font-data text-[11px] uppercase tracking-[0.04em] text-ink-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus)]"
      aria-label={theme === 'dark' ? copy.ui.light : copy.ui.dark}
    >
      {label}
    </button>
  );
}
