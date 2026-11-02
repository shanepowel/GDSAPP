import type { Engagement, NextAction } from './types';

/**
 * The next-action rules engine.
 *
 * Pure function: no clock, no database. Every engagement shows the first matching rule as its
 * "Next action". The same rules feed the "Needs attention" list on Home.
 * Rule order and copy come from docs/redesign/SCREENS.md (section: Rules engine) and the
 * DAA Delivery Handbook. Change the table there first, then here, then the tests.
 */
export function nextActionsFor(e: Engagement): NextAction[] {
  const base = `/v2/engagements/${e.id}`;
  const out: NextAction[] = [];
  const push = (a: NextAction) => out.push(a);

  if (e.status === 'off-track' && !e.lastRiskLockWithinWindow) {
    push({ priority: 1, text: 'Book a risk lock. This engagement is off track.', cta: 'Book risk lock', href: `${base}/decisions`, tone: 'urgent' });
  }
  if (e.status === 'at-risk' && !e.hasRecoveryPlan) {
    push({ priority: 2, text: `Add a recovery plan this week. ${e.statusReason}`, cta: 'Add recovery plan', href: `${base}/compass`, tone: 'urgent' });
  }
  if (e.nextSteering && !e.nextSteering.packReady && !e.nextSteering.held) {
    push({ priority: 3, text: `Draft the steering committee pack for ${e.nextSteering.date}.`, cta: 'Draft pack', href: `${base}/decisions`, tone: 'normal' });
  }
  const unconfirmed = e.decisions.filter((d) => !d.confirmedInWriting).length;
  if (unconfirmed > 0) {
    push({ priority: 4, text: `Confirm ${unconfirmed} ${unconfirmed === 1 ? 'decision' : 'decisions'} in writing.`, cta: 'Confirm decisions', href: `${base}/decisions`, tone: 'normal' });
  }
  const stageOpen = e.checklist.filter((c) => c.stage === e.stage && !c.done).length;
  if (e.stage === 'sprint-zero' && stageOpen > 0) {
    push({ priority: 5, text: `Finish ${stageOpen} Sprint Zero ${stageOpen === 1 ? 'item' : 'items'} before your first delivery sprint.`, cta: 'Open checklist', href: base, tone: 'normal' });
  }
  for (const cr of e.changeRequests) {
    if (cr.stage === 'submitted' && cr.daysInStage > 2) {
      push({ priority: 6, text: `Triage change request ${cr.ref}.`, cta: 'Triage', href: `${base}/change`, tone: 'normal' });
    }
    if (cr.stage === 'triaged' && cr.daysInStage > 5) {
      push({ priority: 7, text: `Assess change request ${cr.ref}.`, cta: 'Assess', href: `${base}/change`, tone: 'normal' });
    }
  }
  const noEnd = e.squad.filter((s) => s.keel.kind === 'exception-no-end').length;
  if (noEnd > 0) {
    push({ priority: 8, text: `Set an end date for ${noEnd === 1 ? 'one Keel exception' : `${noEnd} Keel exceptions`}.`, cta: 'Set end date', href: '/v2/people', tone: 'normal' });
  }
  if (e.goLiveDate && !e.aftercareAgreed && (e.stage === 'beta' || e.stage === 'live')) {
    push({ priority: 9, text: `Set up aftercare before go-live on ${e.goLiveDate}.`, cta: 'Set up aftercare', href: `${base}/change`, tone: 'normal' });
  }
  if (e.monthlyReportDueInDays <= 3) {
    push({ priority: 10, text: "Draft this month's report.", cta: 'Draft report', href: `${base}/compass`, tone: 'normal' });
  }
  if (!e.surveysSentThisMonth.health) {
    push({ priority: 11, text: "Send this month's team health check.", cta: 'Send survey', href: `${base}/compass`, tone: 'calm' });
  } else if (!e.surveysSentThisMonth.pulse) {
    push({ priority: 11, text: "Send this month's client pulse.", cta: 'Send pulse', href: `${base}/compass`, tone: 'calm' });
  }
  if (e.charterReviewOverdue) {
    push({ priority: 12, text: 'Review the squad charter at your next retrospective.', cta: 'Open charter', href: `${base}/squad`, tone: 'calm' });
  }

  out.sort((a, b) => a.priority - b.priority);
  if (out.length === 0) {
    out.push({
      priority: 13,
      text: e.nextMilestone ? `You are on track. Next milestone: ${e.nextMilestone.name} on ${e.nextMilestone.date}.` : 'You are on track.',
      cta: 'View plan',
      href: `${base}/plan`,
      tone: 'calm',
    });
  }
  return out;
}

export function nextActionFor(e: Engagement): NextAction {
  return nextActionsFor(e)[0];
}

/** Suggested status from the four measures. The Squad Lead confirms it; Assemble never sets it alone. */
export function suggestedStatus(m: Engagement['measures'], milestoneWillBeMissed: boolean) {
  const below = [
    m.predictability < 80,
    m.quality !== null && m.quality >= 1,
    m.teamHealth < 4,
    m.clientSatisfaction < 4,
  ].filter(Boolean).length;
  if (below >= 2 || milestoneWillBeMissed) return 'off-track' as const;
  if (below === 1) return 'at-risk' as const;
  return 'on-track' as const;
}
