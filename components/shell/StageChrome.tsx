'use client';

import Link from 'next/link';
import { TeachPanel } from '@/components/teach/TeachPanel';
import { useI18n } from '@/components/app/LocaleProvider';
import { fillCopy } from '@/lib/copy';
import { getCopy } from '@/lib/copy-i18n';
import { STAGE_DEFS, stageDefForPath, type StageId } from '@/lib/explain/stages';

export function StageChrome({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const { locale } = useI18n();
  const copy = getCopy(locale);
  const def = stageDefForPath(pathname);
  if (!def) return <>{children}</>;

  const stageCopy = copy.journey[def.id];
  const prev = def.previousId ? STAGE_DEFS.find((s) => s.id === def.previousId) : null;
  const next = def.nextId ? STAGE_DEFS.find((s) => s.id === def.nextId) : null;

  return (
    <>
      <p className="stage-handover">{stageCopy.handover}</p>
      <TeachPanel tag={stageCopy.label} title={stageCopy.label}>
        <p>{stageCopy.narration}</p>
      </TeachPanel>
      {children}
      <nav className="stage-pager" aria-label={copy.nav.stages}>
        {prev ? (
          <Link href={stageHref(prev.id, pathname)} className="stage-pager-link">
            {fillCopy(copy.journey.previous, { label: copy.journey[prev.id].label })}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={stageHref(next.id, pathname)} className="stage-pager-link">
            {fillCopy(copy.journey.next, { label: copy.journey[next.id].label })}
          </Link>
        ) : null}
      </nav>
    </>
  );
}

function stageHref(id: StageId, currentPath: string): string {
  const def = STAGE_DEFS.find((s) => s.id === id);
  if (!def) return '/practice';
  const engagementMatch = currentPath.match(/^\/(?:squads|assurance)\/([^/]+)/);
  if (id === 'assemble' && engagementMatch) return `/squads/${engagementMatch[1]}`;
  if (id === 'assure' && engagementMatch) return `/assurance/${engagementMatch[1]}`;
  return def.href;
}
