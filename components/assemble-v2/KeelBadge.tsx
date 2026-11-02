import type { KeelStatus } from '@/lib/assemble-v2/types';
import { Badge } from './Badge';

/** Shows whether an assignment follows The Keel's assignment, capacity and tenure rules. */
export function KeelBadge({ status }: { status: KeelStatus }) {
  switch (status.kind) {
    case 'ok':
      return <Badge tone="ok">OK</Badge>;
    case 'exception':
      return <Badge tone="brand">Exception until {status.until}</Badge>;
    case 'exception-no-end':
      return <Badge tone="warn">Exception, no end date</Badge>;
    case 'over-capacity':
      return <Badge tone="warn">Over capacity ({status.allocation}%)</Badge>;
  }
}
