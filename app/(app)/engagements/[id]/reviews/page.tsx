'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/app/AppShell';
import { AppNav } from '@/components/app/AppNav';
import { EngagementSubNav } from '@/components/app/EngagementSubNav';
import { DeploymentBanner } from '@/components/app/DeploymentBanner';
import { RequirementSelector } from '@/components/app/RequirementSelector';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/components/app/LocaleProvider';
import { useRequirementId } from '@/lib/hooks/use-requirement-id';
import { trpc } from '@/lib/trpc/client';

const SUBJECT_TYPES = [
  'readiness_overall',
  'analysis_run',
  'report',
  'rigour_overall',
] as const;

export default function ReviewsPage() {
  const { messages: m } = useI18n();
  const params = useParams();
  const id = params.id as string;
  const { data: engagement } = trpc.engagement.byId.useQuery({ id });
  const { data: members } = trpc.user.listMembers.useQuery();
  const { data: requests, refetch } = trpc.review.list.useQuery({ engagementId: id });
  const create = trpc.review.create.useMutation({ onSuccess: () => refetch() });
  const respond = trpc.review.respond.useMutation({ onSuccess: () => refetch() });

  const { requirementId, setRequirementId } = useRequirementId(id, engagement?.requirements);

  const [title, setTitle] = useState('');
  const [subjectType, setSubjectType] = useState<string>('readiness_overall');
  const [minApprovals, setMinApprovals] = useState(2);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

  const { data: session } = useSession();
  const myId = session?.user?.id;
  const pendingForMe = requests?.flatMap((r) =>
    r.assignments
      .filter((a) => a.status === 'pending' && a.reviewerUserId === myId)
      .map((a) => ({ request: r, assignment: a })),
  );

  return (
    <AppShell title={m.reviews.title} standardId={engagement?.standardId}>
      <DeploymentBanner />
      <AppNav />
      <EngagementSubNav engagementId={id} />
      <p className="mb-4 text-sm text-text-muted">{m.reviews.intro}</p>
      {engagement?.requirements && (
        <RequirementSelector
          requirements={engagement.requirements}
          value={requirementId}
          onChange={setRequirementId}
        />
      )}

      <form
        className="mb-8 max-w-xl rounded-2xl border border-border bg-surface p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || selectedReviewers.length === 0) return;
          create.mutate({
            engagementId: id,
            title: title.trim(),
            subjectType,
            subjectId: requirementId ?? 'general',
            minApprovals,
            reviewerUserIds: selectedReviewers,
          });
          setTitle('');
          setSelectedReviewers([]);
        }}
      >
        <h2 className="font-semibold">{m.reviews.createTitle}</h2>
        <label className="mt-3 block text-sm">
          {m.reviews.requestTitle}
          <input
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          {m.reviews.subjectType}
          <select
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
            value={subjectType}
            onChange={(e) => setSubjectType(e.target.value)}
          >
            {SUBJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm">
          {m.reviews.minApprovals}
          <input
            type="number"
            min={1}
            max={10}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
            value={minApprovals}
            onChange={(e) => setMinApprovals(Number(e.target.value))}
          />
        </label>
        <fieldset className="mt-3">
          <legend className="text-sm font-medium">{m.reviews.reviewers}</legend>
          <div className="mt-2 space-y-1">
            {members?.map((u) => (
              <label key={u.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedReviewers.includes(u.id)}
                  onChange={(e) => {
                    setSelectedReviewers((prev) =>
                      e.target.checked ? [...prev, u.id] : prev.filter((x) => x !== u.id),
                    );
                  }}
                />
                {u.name ?? u.email}
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit" className="mt-4" disabled={create.isPending}>
          {m.reviews.submitRequest}
        </Button>
      </form>

      {pendingForMe && pendingForMe.length > 0 && (
        <section className="mb-8 rounded-lg border border-brand/30 bg-brand-tint p-5">
          <h2 className="font-semibold">{m.reviews.yourPending}</h2>
          <ul className="mt-3 space-y-4">
            {pendingForMe.map(({ request, assignment }) => (
              <li key={assignment.id} className="rounded border border-border bg-surface p-4 text-sm">
                <p className="font-medium">{request.title}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      respond.mutate({
                        assignmentId: assignment.id,
                        engagementId: id,
                        status: 'approved',
                      })
                    }
                  >
                    {m.reviews.approve}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      respond.mutate({
                        assignmentId: assignment.id,
                        engagementId: id,
                        status: 'rejected',
                      })
                    }
                  >
                    {m.reviews.reject}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-semibold">{m.reviews.chainsTitle}</h2>
        <ul className="mt-3 space-y-4">
          {requests?.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-surface p-4 text-sm">
              <p className="font-medium">
                {r.title} ·{' '}
                {r.status === 'open'
                  ? m.reviews.statusOpen
                  : r.status === 'approved'
                    ? m.reviews.statusApproved
                    : m.reviews.statusRejected}
              </p>
              <ul className="mt-2 space-y-1 text-text-muted">
                {r.assignments.map((a) => (
                  <li key={a.id}>
                    {a.reviewer.name ?? a.reviewer.email}: {a.status}
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {!requests?.length && <p className="text-text-muted">{m.reviews.noRequests}</p>}
        </ul>
      </section>

      <Link href={`/engagements/${id}`} className="mt-6 inline-block text-sm text-brand hover:underline">
        ← {m.engagement.subOverview}
      </Link>
    </AppShell>
  );
}
