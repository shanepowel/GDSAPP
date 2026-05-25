'use client';

import { useI18n } from '@/components/app/LocaleProvider';
import type { Locale } from '@/lib/i18n/types';

export function LanguageSwitcher() {
  const { locale, setLocale, messages } = useI18n();

  return (
    <label className="flex items-center gap-2 text-[12px] text-text-muted">
      <span className="sr-only">{messages.app.language}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="rounded-md border border-border bg-surface px-2 py-1 text-[12px] text-text"
        aria-label={messages.app.language}
      >
        <option value="en">{messages.app.english}</option>
        <option value="cy">{messages.app.welsh}</option>
      </select>
    </label>
  );
}
