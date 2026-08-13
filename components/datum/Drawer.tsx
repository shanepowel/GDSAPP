'use client';

import { useEffect } from 'react';
import { useI18n } from '@/components/app/LocaleProvider';
import { getCopy } from '@/lib/copy-i18n';

export function Drawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { locale } = useI18n();
  const copy = getCopy(locale);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <aside
      className={`datum-drawer${open ? ' is-open' : ''}`}
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      inert={!open}
      hidden={!open}
    >
      <button type="button" className="datum-drawer-close" onClick={onClose}>
        {copy.ui.close}
      </button>
      {open ? children : null}
    </aside>
  );
}
