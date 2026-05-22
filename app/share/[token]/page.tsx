import { getSharePayload } from '@/lib/share';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getSharePayload(token);

  if (!data) {
    return (
      <div className="min-h-screen bg-bg p-8">
        <h1 className="font-display text-xl font-bold text-text">Link unavailable</h1>
        <p className="mt-2 text-text-muted">This share link has expired or does not exist.</p>
      </div>
    );
  }

  const result = data.lastRun?.result as {
    overallReadiness?: number;
    readinessBand?: string;
    bidOutlook?: { overallQualityOutlook: number; topPointMovers: { text: string }[] };
    adaptation?: { actions: { title: string; feasible?: boolean }[] };
  } | null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface px-6 py-4">
        <p className="text-sm text-text-muted">Read-only shared report</p>
        <h1 className="font-display text-2xl font-bold text-text">{data.engagementName}</h1>
      </header>
      <main className="mx-auto max-w-container px-6 py-8">
        {result && (
          <>
            <section className="rounded-lg border border-border bg-surface p-5">
              <h2 className="font-semibold">Executive summary</h2>
              <p className="mt-2 text-sm">
                Readiness: {result.overallReadiness ?? data.lastRun?.overallReadiness}% (
                {result.readinessBand ?? data.lastRun?.readinessBand})
              </p>
              {result.bidOutlook && (
                <p className="mt-1 text-sm">
                  Quality outlook (weighted): {result.bidOutlook.overallQualityOutlook}%
                </p>
              )}
            </section>
            {result.bidOutlook?.topPointMovers && (
              <section className="mt-6 rounded-lg border border-border bg-surface p-5">
                <h2 className="font-semibold">Top point-movers</h2>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {result.bidOutlook.topPointMovers.slice(0, 3).map((m) => (
                    <li key={m.text}>{m.text}</li>
                  ))}
                </ul>
              </section>
            )}
            {result.adaptation?.actions && (
              <section className="mt-6 rounded-lg border border-border bg-surface p-5">
                <h2 className="font-semibold">Adaptation headline</h2>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {result.adaptation.actions.slice(0, 3).map((a) => (
                    <li key={a.title}>
                      {a.title}
                      {a.feasible === false ? ' (over budget)' : ''}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
        <footer className="mt-12 text-xs text-text-muted">
          Open Government Licence. Centre for Digital Public Services frameworks. Advisory only.
        </footer>
      </main>
    </div>
  );
}
