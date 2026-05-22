'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { StatusPill, type StatusKind } from '@/components/app/StatusPill';

export interface RationaleRow {
  requirement: string;
  held: string;
  match: 'met' | 'partial' | 'unmet';
}

export function RationaleDisclosure({ rows }: { rows: RationaleRow[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-hover hover:underline"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        {open ? 'Hide working' : 'Show working'}
      </button>
      {open && (
        <table className="mt-2 w-full text-[13px]">
          <thead>
            <tr className="text-left text-text-muted">
              <th className="py-1 font-medium">Requirement</th>
              <th className="py-1 font-medium">Held</th>
              <th className="py-1 font-medium">Match</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-1.5 pr-3">{r.requirement}</td>
                <td className="py-1.5 pr-3">{r.held}</td>
                <td className="py-1.5">
                  <StatusPill
                    kind={
                      (r.match === 'met' ? 'met' : r.match === 'partial' ? 'partial' : 'gap') as StatusKind
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
