import { Panel } from '@/components/library/Panel';

export function Card({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Panel className={className} style={style}>
      {children}
    </Panel>
  );
}
