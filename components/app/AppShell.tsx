import Link from 'next/link';

export function AppShell({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/engagements" className="font-display text-lg font-bold text-text">
              Assemble
            </Link>
            <span className="text-sm text-text-muted">Amplified Ltd</span>
          </div>
          {actions}
        </div>
      </header>
      <main className="mx-auto max-w-container px-6 py-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-text">{title}</h1>
        {children}
      </main>
      <footer className="mx-auto max-w-container px-6 py-8 text-xs text-text-muted">
        Advisory tool. Built on public frameworks under the Open Government Licence. Not a hiring or sift decision.
      </footer>
    </div>
  );
}
