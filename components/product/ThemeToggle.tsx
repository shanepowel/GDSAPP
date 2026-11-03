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
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius)] border border-[color:var(--on-navy-mute)] bg-transparent px-3 text-[12.5px] text-[color:var(--on-navy)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus)]"
      aria-label={theme === 'dark' ? copy.ui.light : copy.ui.dark}
    >
      {label}
    </button>
  );
}
