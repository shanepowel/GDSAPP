/**
 * Turns a next-action result into one complete sentence.
 * Picks a stored sentence. Does not join fragments.
 */

import type { NextAction } from '@/lib/attention/next-action';
import { fillCopy } from '@/lib/copy';

export interface NextActionTemplates {
  riskLock: string;
  recovery: string;
  steeringPack: string;
  steeringPackOpen: string;
  confirmDecisions: string;
  sprintZero: string;
  sprintZeroOpen: string;
  triageChange: string;
  assessChange: string;
  keelEnd: string;
  aftercare: string;
  aftercareOpen: string;
  monthlyReport: string;
  surveyHealth: string;
  surveyPulse: string;
  charterReview: string;
  onTrack: string;
  onTrackOpen: string;
}

export function nextActionSentence(action: NextAction, templates: NextActionTemplates): string {
  const vars = action.vars;
  switch (action.code) {
    case 'risk-lock':
      return templates.riskLock;
    case 'recovery':
      return templates.recovery;
    case 'steering-pack':
      return vars.date
        ? fillCopy(templates.steeringPack, { date: vars.date })
        : templates.steeringPackOpen;
    case 'confirm-decisions':
      return fillCopy(templates.confirmDecisions, { n: vars.n ?? 0 });
    case 'sprint-zero':
      return vars.date
        ? fillCopy(templates.sprintZero, { n: vars.n ?? 0, date: vars.date })
        : fillCopy(templates.sprintZeroOpen, { n: vars.n ?? 0 });
    case 'triage-change':
      return fillCopy(templates.triageChange, { ref: vars.ref ?? '' });
    case 'assess-change':
      return fillCopy(templates.assessChange, { ref: vars.ref ?? '' });
    case 'keel-end':
      return fillCopy(templates.keelEnd, { person: vars.person ?? '' });
    case 'aftercare':
      return vars.date
        ? fillCopy(templates.aftercare, { date: vars.date })
        : templates.aftercareOpen;
    case 'monthly-report':
      return templates.monthlyReport;
    case 'survey':
      return vars.survey === 'pulse' ? templates.surveyPulse : templates.surveyHealth;
    case 'charter-review':
      return templates.charterReview;
    case 'on-track':
      return vars.milestone && vars.date
        ? fillCopy(templates.onTrack, { milestone: vars.milestone, date: vars.date })
        : templates.onTrackOpen;
  }
}
