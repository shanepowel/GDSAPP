/** An invitation, why it matters, and one action. */
export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-asm-lg border border-dashed border-asm-line-strong bg-asm-surface px-6 py-8">
      <h3 className="text-base font-bold text-asm-brand">{title}</h3>
      <p className="max-w-prose text-sm text-asm-ink-2">{body}</p>
      {action}
    </div>
  );
}
