import { ButtonLink } from '@/components/library/Button';
import { space } from '@/components/library/sizing';

export function NextActionCard({
  sentence,
  action,
  href,
}: {
  sentence: string;
  action: string;
  href: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space(3),
        padding: space(4),
        background: 'var(--raised)',
        border: 'var(--rule-w) solid var(--rule)',
        borderLeft: 'var(--plate-w) solid var(--navy)',
        borderRadius: 'var(--radius)',
      }}
    >
      <p
        style={{
          margin: 0,
          maxWidth: '62ch',
          color: 'var(--ink)',
          fontSize: 'var(--type-body-size)',
          lineHeight: 'var(--type-body-leading)',
        }}
      >
        {sentence}
      </p>
      <ButtonLink href={href} size="sm">
        {action}
      </ButtonLink>
    </div>
  );
}
