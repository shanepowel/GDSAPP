import { cn } from '@/lib/cn';

/** Card: white surface, 1px line, large radius. Use CardHeader for a titled section. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn('rounded-asm-lg border border-asm-line bg-asm-surface', className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  id,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-asm-line px-6 py-5', className)}>
      <div className="flex flex-col gap-0.5">
        <h2 id={id} className="text-lg font-bold text-asm-brand">
          {title}
        </h2>
        {description ? <p className="text-sm text-asm-ink-3">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-wrap items-center justify-between gap-2 bg-asm-canvas px-6 py-3.5 text-sm', className)} {...props} />;
}
