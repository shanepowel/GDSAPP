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
    <div
      className={`rounded-2xl bg-surface shadow-sm ${className}`}
      style={{ border: '1px solid var(--color-border)', boxShadow: '0 1px 2px rgba(0,0,0,.04)', ...style }}
    >
      {children}
    </div>
  );
}
