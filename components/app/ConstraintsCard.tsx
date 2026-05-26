'use client';

import { useState } from 'react';
import { Card } from '@/components/app/Card';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/client';

export function ConstraintsCard({
  requirementId,
  engagementId,
}: {
  requirementId: string;
  engagementId: string;
}) {
  const { data, refetch } = trpc.extension.constraint.get.useQuery({ requirementId });
  const upsert = trpc.extension.constraint.upsert.useMutation({ onSuccess: () => refetch() });

  const [budgetCap, setBudgetCap] = useState('');
  const [internalRate, setInternalRate] = useState('');
  const [partnerRate, setPartnerRate] = useState('');
  const [startBy, setStartBy] = useState('');
  const [endBy, setEndBy] = useState('');
  const [open, setOpen] = useState(false);

  function loadFromData() {
    if (!data) return;
    setBudgetCap(data.budgetCap != null ? String(data.budgetCap) : '');
    setInternalRate(data.internalRatePerDay != null ? String(data.internalRatePerDay) : '');
    setPartnerRate(data.partnerRatePerDay != null ? String(data.partnerRatePerDay) : '');
    setStartBy(data.startBy ? data.startBy.toISOString().slice(0, 10) : '');
    setEndBy(data.endBy ? data.endBy.toISOString().slice(0, 10) : '');
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-text">Delivery constraints</h2>
          <p className="mt-1 text-sm text-text-muted">
            Budget and day rates feed adaptation economics on the next analysis run.
          </p>
        </div>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            setOpen(!open);
            if (!open) loadFromData();
          }}
        >
          {open ? 'Close' : data ? 'Edit' : 'Add'}
        </Button>
      </div>
      {data && !open && (
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">Budget cap</dt>
            <dd className="font-medium tabular-nums">
              {data.budgetCap != null ? `£${data.budgetCap.toLocaleString('en-GB')}` : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Internal day rate</dt>
            <dd className="font-medium tabular-nums">
              {data.internalRatePerDay != null ? `£${data.internalRatePerDay}` : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Partner day rate</dt>
            <dd className="font-medium tabular-nums">
              {data.partnerRatePerDay != null ? `£${data.partnerRatePerDay}` : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Window</dt>
            <dd className="font-medium">
              {data.startBy || data.endBy
                ? `${data.startBy ? new Date(data.startBy).toLocaleDateString('en-GB') : '-'} → ${data.endBy ? new Date(data.endBy).toLocaleDateString('en-GB') : '-'}`
                : '-'}
            </dd>
          </div>
        </dl>
      )}
      {open && (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            upsert.mutate({
              requirementId,
              budgetCap: budgetCap ? Number(budgetCap) : undefined,
              internalRatePerDay: internalRate ? Number(internalRate) : undefined,
              partnerRatePerDay: partnerRate ? Number(partnerRate) : undefined,
              startBy: startBy ? new Date(startBy) : undefined,
              endBy: endBy ? new Date(endBy) : undefined,
            });
            setOpen(false);
          }}
        >
          <label className="text-sm">
            <span className="font-medium">Budget cap (£)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              value={budgetCap}
              onChange={(e) => setBudgetCap(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Internal day rate (£)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              value={internalRate}
              onChange={(e) => setInternalRate(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Partner day rate (£)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              value={partnerRate}
              onChange={(e) => setPartnerRate(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Start by</span>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              value={startBy}
              onChange={(e) => setStartBy(e.target.value)}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-medium">End by</span>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              value={endBy}
              onChange={(e) => setEndBy(e.target.value)}
            />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={upsert.isPending}>
              Save constraints
            </Button>
          </div>
        </form>
      )}
      <input type="hidden" value={engagementId} readOnly aria-hidden />
    </Card>
  );
}
