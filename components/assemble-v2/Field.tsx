import { cn } from '@/lib/assemble-v2/cn';

/** Form field with a visible, persistent label. Never use placeholder as the label. */
export function Field({ id, label, hint, children, className }: { id: string; label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-asm-ink">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-asm-ink-3">
          {hint}
        </p>
      ) : null}
      {children}
    </div>
  );
}

const control = 'w-full rounded-asm border border-asm-line-strong bg-asm-surface px-3.5 py-2.5 text-[15px] text-asm-ink placeholder:text-asm-ink-3';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, 'h-11', className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, 'min-h-24', className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, 'h-11', className)} {...props}>
      {children}
    </select>
  );
}
