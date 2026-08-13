/**
 * lib/copy.ts
 *
 * Every user-facing string in one place, so the marketing site and the product
 * cannot drift apart. Rules, from doc 11 section 1:
 *
 *  - Say what the product does, never how the client will feel.
 *  - "Resource" never means a person. Banned everywhere.
 *  - Government Digital and Data Profession Capability Framework on first use,
 *    DDaT as a parenthetical only.
 *  - No claim that is not reachable on screen within two clicks.
 *  - Sentence case. Buttons name what happens.
 *
 * Welsh strings live in lib/copy.cy.ts and must exist before any string here
 * reaches production.
 */

export const copy = {
  product: {
    name: 'Datum',
    owner: 'Turner & Townsend',
    thesis: 'The team is the delivery plan.',
    strapline:
      'How Turner & Townsend defines good delivery, measures the capability we hold against it, and assembles the squad that can do the work.',
  },

  home: {
    eyebrow: 'Delivery practice',
    headline: 'The team is the delivery plan.',
    sub: 'Not the method, not the schedule. The people who turn up every day. Datum sets out what good delivery means here, scores the capability we actually hold against it, and assembles the squad for a specific job. Government Digital and Data capability scoring and service standard readiness are built in.',
    primaryCta: 'Walk the demo',
    secondaryCta: 'Read the practice',
    signIn: 'Sign in',

    claims: [
      {
        title: 'Define good, in public',
        body: 'The playbook is open and readable before you sign in. Five pillars, the ceremonies that feed them, and what each one has to produce. Nothing is scored that the practice does not require.',
        seeIn: 'See it in Practice',
      },
      {
        title: 'See the organisation, then change it',
        body: 'Circles, roles and the people who hold them, drawn from the live design. Templates, scenarios and vacancies sit on the same view, so a redesign is a visible move rather than a slide.',
        seeIn: 'See it in People',
      },
      {
        title: 'Assemble the squad',
        body: 'Every candidate scored against the role: capability framework skills first, then adjusted by evidenced delivery discipline. One datum line at 0.60 runs through the whole table so a squad reads in a single pass.',
        seeIn: 'See it in Squads',
      },
      {
        title: 'Read it through any standard',
        body: 'The same squad, assessed against the standard that governs the client. GDS, the Wales Digital Service Standard, gateway review, or the information management duties on a capital programme.',
        seeIn: 'See it in Assurance',
      },
    ],

    credibility: {
      title: 'Unevidenced is not the same as poor',
      body: 'When we hold no delivery evidence about somebody, their multiplier stays at exactly 1.00 and the interface says so. Absence of evidence is a finding about our instrumentation, never a judgement about a person. Nobody is scored down for a gap in our own records.',
    },

    reasoning: {
      title: 'Every number opens',
      body: 'No composite appears without its working one interaction away: which skills, at what level, against what the role requires, and which pieces of delivery evidence moved it. A panel that pushes back gets the reasoning, not a footnote.',
    },
  },

  nav: {
    practice: { label: 'Practice', hint: 'what good delivery is' },
    people: { label: 'People', hint: 'capability we hold' },
    squads: { label: 'Squads', hint: 'the team for this job' },
    assurance: { label: 'Assurance', hint: 'readiness against standards' },
    portfolio: { label: 'Portfolio', hint: 'across engagements' },
  },

  context: {
    engagement: 'Engagement',
    phase: 'Phase',
    standards: 'Standards applied',
    maturity: 'Maturity',
    changeEngagement: 'Change engagement',
    maturityValue: 'Level {level} · {name}',
  },

  verdicts: {
    met: 'Met',
    atRisk: 'At risk',
    notMet: 'Not met',
    notAssessed: 'Not assessed',
  },

  bands: {
    strong: 'Assign without qualification.',
    viable: 'Assign, and note the development need.',
    stretch: 'Assign only with a stated reason and a support plan.',
    gap: 'Do not assign. This raises a capability gap.',
  },

  gaps: {
    skills_gap: 'The capability is not held at the level this role needs.',
    rigour_gap: 'The skills are here. The delivery discipline is not evidenced.',
    capacity_gap: 'The right person is available in principle but not in practice.',
  },

  empty: {
    noSquad: 'No squad assembled yet.',
    noSquadWhy: 'Choose an archetype and compute fit to score the pool against the roles this job needs.',
    noPeople: 'No people in the pool.',
    noPeopleWhy:
      'The pool is what the organisation can field. Add people on an engagement, or import from the capability framework.',
    noSignals:
      'No delivery evidence recorded for this person. Their multiplier stays at 1.00. Connect an allocation source to derive tenure and capacity signals automatically.',
    noGaps: 'Every role is filled above the datum. Nothing outstanding for this archetype.',
    noEngagements: 'No engagements yet.',
    noEngagementsWhy:
      'An engagement is the job. Create one to assemble a squad and read it through the standard that governs the work.',
    noScores: 'No fit scores yet.',
    noScoresWhy: 'Choose an archetype and compute fit to see every role against the datum.',
    noAnalysis: 'Not assessed yet.',
    noAnalysisWhy:
      'Run the assessment to read this squad through the standard that governs the engagement.',
  },

  errors: {
    scoreStale:
      'These figures were computed before the last change to skills or allocations. Recompute to refresh.',
    frameworkDrift:
      'This archetype references a skill that has since been renamed in the capability framework. The figure still resolves against the version it was computed on.',
  },

  practice: {
    pillarsTitle: 'What good delivery means here',
    pillarsLede:
      'Five pillars, one operating model. Every figure in Datum traces to something on this list. Nothing is measured that the practice does not require.',
    ceremoniesTitle: 'Ceremonies, and what each one has to emit',
    ceremoniesLede:
      'No ceremony survives unless it produces something the squad uses next week or assurance requires later. Everything below feeds a figure.',
    maturityTitle: 'Where a delivery practice gets to',
    standardsTitle: 'Definitions of ready and done',
    standardsLede:
      'Extended definitions of ready and done carry statutory and assurance criteria into the ticket, so a gate review is assembly, not authorship.',
    keelTitle: 'The Keel',
    keelLede:
      'Continuity is an assurance control. Core roles stay for a complete phase at 0.8 FTE or above. Capacity splits 70 / 20 / 10: committed, discretionary, slack.',
    pillar: 'Pillar',
    owns: 'Owns',
    produces: 'What it produces for assurance',
    ceremony: 'Ceremony',
    cadence: 'Cadence',
    emits: 'Emits',
    signal: 'Signal',
    youAreHere: 'you are here',
    readyTitle: 'Definition of ready',
    doneTitle: 'Definition of done',
    keelNumbers: 'Core role minimum {fte} FTE · capacity {split}',
  },

  people: {
    eyebrow: 'People',
    title: 'Capability we actually hold',
    lede: 'The live structure first: circles, roles and who holds them. Change the design here. The pool below is what the organisation can field before any one engagement asks for it.',
    viewAsGraph: 'View as graph',
    viewAsTable: 'View as table',
    pool: 'The pool',
    person: 'Person',
    free: 'Free',
    available: 'available',
    tenure: 'Tenure',
    rigour: 'Rigour evidence',
    skills: 'Skills',
    strongestFit: 'Strongest fit',
    unevidenced: 'Unevidenced',
    peopleInPool: 'People in pool',
    unallocated: 'Unallocated FTE',
    unevidencedCount: 'Unevidenced',
    dataGap: 'A data gap, not a judgement',
    graphHint:
      'The organisation in action. Table, templates and scenarios sit on the same People view.',
    openPerson: 'Open person',
    noSkills: 'No skills recorded.',
    skillsHeld: 'Skills held',
    assignments: 'Assignments',
    rigourSignals: 'Rigour evidence',
    noAssignments: 'No assignments.',
    fteHeld: '{fte} FTE',
    assignmentCount: '{count} assignments',
    personLede: '{fte} FTE · {count} assignments',
  },

  squads: {
    eyebrow: 'Squads',
    title: 'Roles and best available fit',
    indexTitle: 'Squads',
    indexLede:
      'Assemble the team for a specific job. Every role is scored against the datum at 0.60.',
    lede:
      'Each candidate is scored on capability framework skills, then adjusted by evidenced delivery rigour. The vertical line is the datum: 0.60, the point below which a role is not safely filled.',
    role: 'Role',
    criticality: 'Criticality',
    bestCandidate: 'Best candidate',
    fitAgainstDatum: 'Fit against datum',
    composite: 'Composite',
    capacityFlag: 'capacity',
    selectHint: 'Open a role to see the working. Every candidate sits one click further on.',
    gapsTitle: 'What this squad cannot yet cover',
    finding: 'Finding',
    move: 'Move',
    standardAtRisk: 'Standard at risk',
    moves: {
      upskill: 'Upskill',
      second: 'Second',
      recruit: 'Recruit',
      rescope: 'Rescope',
    },
    roleEyebrow: 'Archetype role',
    rankedCandidates: 'Every candidate, ranked',
    candidateMeta: 'skill {skill} · rigour ×{rigour}',
    compute: 'Recompute fit',
    archetype: 'Archetype',
    phase: 'Phase',
    standard: 'Standard',
    standardWales: 'Wales Digital Service Standard',
    standardGds: 'GDS Service Standard',
    confirmProposal: 'Confirm proposal',
    allCandidates: 'Every candidate',
    unfilled: 'Unfilled',
    recruit: 'Recruit',
    bestAvailable: 'best available {score}',
  },

  assurance: {
    eyebrow: 'Assurance',
    title: 'Readiness against the standards that apply',
    lede:
      'The same squad, read through whichever standard the client is governed by. Points at risk that trace to a role below the datum close by assignment rather than by argument.',
    indexLede:
      'Choose an engagement to read its squad through the standard that governs the work.',
    point: 'Point',
    requirement: 'Requirement',
    status: 'Status',
    why: 'Why',
    preparedness: 'Preparedness Index',
    pointsAtRisk: 'Points at risk',
    inThisPhase: 'In this phase',
    openAssess: 'Open assess',
  },

  portfolio: {
    eyebrow: 'Portfolio',
    title: 'Across every engagement',
    lede:
      'Where capability is thin, where evidence is missing, and which gates are exposed. The roll-up a delivery director takes into a monthly review.',
    engagements: 'Engagements',
    nextGate: 'Next gate',
    rolesBelowDatum: 'Roles below datum',
    maturity: 'Maturity',
    meanPreparedness: 'Mean preparedness',
    meanRigour: 'Mean rigour',
    openGaps: 'Open gaps',
    withAnalysis: '{count} with analysis',
    acrossAnalysed: 'across analysed engagements',
    deliveryDiscipline: 'delivery discipline',
    statutoryCount: '{count} statutory',
  },

  tour: {
    region: 'Guided walk',
    step: 'Step {current} of {total}',
    back: 'Back',
    next: 'Next',
    dismiss: 'Dismiss',
    steps: [
      {
        view: 'practice',
        href: '/',
        text: 'Start with the practice, not the product. Datum measures against one published definition of good delivery, so every figure later has something to be a figure of.',
      },
      {
        view: 'people',
        href: '/people',
        text: 'This is the organisation in action: circles, roles, and who holds them. Redesign here. The pool below is the capability you can field, and what we can evidence about how they deliver.',
      },
      {
        view: 'squads',
        href: '/squads',
        text: 'Now the job. Roles from the archetype, every candidate scored, and the datum line at 0.60 running through the whole column so you can read it in one pass.',
      },
      {
        view: 'squads-reason',
        href: '/squads?tour=4',
        text: 'Open any role to see the working. Skills come from the Government Digital and Data Profession Capability Framework. The rigour bracket comes from evidenced delivery discipline. Dashed means unevidenced, which is never the same as poor.',
      },
      {
        view: 'assurance',
        href: '/assurance',
        text: 'The same squad, read through the client’s standard. Points at risk that trace to a role below the datum close by assignment rather than by argument.',
      },
      {
        view: 'portfolio',
        href: '/portfolio',
        text: 'And across the book of work: where capability is thin, which gates are exposed, and what to recruit for.',
      },
    ],
  },

  footer: {
    disclaimer:
      'Demonstration build using the Government Digital and Data Profession Capability Framework, published under the Open Government Licence. Advisory instrument. Not a hiring decision.',
    demonstration: 'Demonstration build',
    representative: 'Representative data only',
  },

  legend: {
    held: 'skill held at required level',
    partial: 'held below required level',
    absent: 'skill not held',
    datum: 'datum, viability at 0.60',
    bracket: 'rigour bracket, dashed when unevidenced',
  },

  ui: {
    loading: 'Loading…',
    createEngagement: 'Create engagement',
    showWorking: 'Show working',
    hideWorking: 'Hide working',
    managePeople: 'Manage people',
    back: 'Back',
    continue: 'Continue',
  },

  wizard: {
    title: 'Create engagement',
    stepsLabel: 'Creation steps',
    steps: ['Client and service', 'Standard and phase', 'Team', 'Mode'],
    clientOrg: 'Client organisation',
    serviceName: 'Service name',
    sector: 'Sector',
    sectorDigital: 'Digital service',
    sectorCapital: 'Capital programme',
    sectorHybrid: 'Hybrid',
    serviceDescription: 'Service description',
    standard: 'Standard',
    phase: 'Phase',
    teamHint: 'Start from a template. CSV import and Entra directory pull land in a later iteration.',
    template: 'Template',
    skipTemplate: 'Skip — add team later',
    mode: 'Mode',
    modeHint:
      'Mode changes defaults, never capability. Bid lands on Organise; Mobilise on People; Assure on Assurance.',
    untitled: 'Untitled engagement',
  },
} as const;

type DeepLoose<T> = T extends string
  ? string
  : T extends ReadonlyArray<infer U>
    ? readonly DeepLoose<U>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepLoose<T[K]> }
      : T;

/** Shape of copy, with string values, so Welsh can differ from English literals. */
export type Copy = DeepLoose<typeof copy>;

/** Fill `{name}` slots in a complete sentence. Never concatenate fragments. */
export function fillCopy(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function gapMoveLabel(copy: Copy, code: string | null | undefined): string {
  const moves = copy.squads.moves;
  if (code && code in moves) return moves[code as keyof typeof moves];
  return copy.squads.recruit;
}

/**
 * Retired. Kept here only so a CI grep can fail the build if any of them
 * reappear outside this block. Delete this once the repo has been clean for a release.
 */
export const RETIRED_STRINGS = [
  'Win the room',
  'before you win the work',
  'Stop defending a slide deck',
  'sell rigour, not promises',
  'representative DDaT roles',
] as const;
