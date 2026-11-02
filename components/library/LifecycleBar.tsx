import Link from 'next/link';
import { lifecycleIndex, LIFECYCLE_STAGES, type LifecycleStage } from '@/lib/attention/lifecycle';
import { space } from '@/components/library/sizing';

export function LifecycleBar({
  current,
  labels,
  doneLabel,
  currentLabel,
  ariaLabel,
  links,
}: {
  current: LifecycleStage | null;
  labels: Record<LifecycleStage, string>;
  doneLabel: string;
  currentLabel: string;
  ariaLabel: string;
  links?: Partial<Record<LifecycleStage, string>>;
}) {
  const currentIndex = current ? lifecycleIndex(current) : -1;

  return (
    <ol
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: space(1),
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}
    >
      {LIFECYCLE_STAGES.map((stage, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'future';
        const body = (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: space(1),
              minHeight: 'var(--target-min)',
              paddingInline: space(2),
              paddingBlock: space(1),
              borderRadius: 'var(--radius)',
              border: `var(--rule-w) solid ${state === 'current' ? 'var(--brand)' : 'var(--rule)'}`,
              background: state === 'current' ? 'var(--brand-wash)' : 'transparent',
              color: state === 'future' ? 'var(--graphite)' : 'var(--ink)',
              fontSize: 'var(--type-meta-size)',
              fontWeight: state === 'current' ? 600 : 400,
              lineHeight: 'var(--type-meta-leading)',
            }}
          >
            {state === 'done' ? (
              <span aria-hidden="true" style={{ color: 'var(--ok)' }}>
                ✓
              </span>
            ) : null}
            {labels[stage]}
            {state === 'done' ? <span className="sr-only"> {doneLabel}</span> : null}
            {state === 'current' ? <span className="sr-only"> {currentLabel}</span> : null}
          </span>
        );
        const href = links?.[stage];
        return (
          <li key={stage} aria-current={state === 'current' ? 'step' : undefined}>
            {href ? (
              <Link href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ol>
  );
}
