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
    roles: { label: 'Roles', hint: 'who does what, plainly' },
    people: { label: 'People', hint: 'capability we hold' },
    squads: { label: 'Build a squad', hint: 'the team for this job' },
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
      'Nothing recorded for this person. Their multiplier stays at 1.00. Connect an allocation source to derive tenure and capacity signals automatically.',
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
    looksLikeTitle: 'What good delivery looks like here',
    looksLikeLede:
      'Read this first. Everything Datum measures is measured against what is on this page, so a figure only means something once you have seen what it is a figure of.',
    pillarsTitle: 'The five pillars',
    pillarsLede:
      'Five pillars, one operating model. Every figure in Datum traces to something on this list. Nothing is measured that the practice does not require.',
    capacityTitle: 'How much of a person\'s week is actually free',
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
    rigour: 'Delivery evidence',
    skills: 'Skills',
    strongestFit: 'Strongest fit',
    unevidenced: 'Nothing recorded',
    peopleInPool: 'People in pool',
    unallocated: 'Unallocated FTE',
    unevidencedCount: 'Nothing recorded',
    dataGap: 'Our data gap, not their failing',
    stayingPower: 'Staying power',
    stable: 'stable',
    settling: 'settling',
    fragmented: 'fragmented',
    graphHint:
      'The organisation in action. Table, templates and scenarios sit on the same People view.',
    openPerson: 'Open person',
    noSkills: 'No skills recorded.',
    skillsHeld: 'Skills held',
    assignments: 'Assignments',
    rigourSignals: 'What we have seen them do',
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
    capacityFlag: 'not enough free time',
    criticalityLabels: {
      core: 'cannot run without',
      supporting: 'weakens delivery',
      optional: 'nice to have',
    },
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
    title: 'Whether this team will pass',
    lede:
      'The same squad, read against the standard the client is governed by. Most of what is at risk here is a team problem wearing a standards costume.',
    indexLede:
      'Choose an engagement to read its squad through the standard that governs the work.',
    point: 'Point',
    requirement: 'Requirement',
    status: 'Status',
    why: 'Why',
    preparedness: 'Preparedness',
    pointsAtRisk: 'Points at risk',
    inThisPhase: 'In this phase',
    openAssess: 'Open assess',
  },

  portfolio: {
    eyebrow: 'Portfolio',
    title: 'Across every engagement',
    lede: 'Where we are thin, which gates are exposed, and what to recruit for next.',
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
        text: 'Start with what good delivery means, because a score is meaningless until you know what it is scoring. The first picture is the whole argument: a team that holds every skill it needs and can decide for itself, against five people on loan who cannot.',
      },
      {
        view: 'practice-clocks',
        href: '/?tour=2',
        text: 'Two clocks. The team works fortnightly. Governance works in gates. They meet at the end of a phase and stay out of each other’s way in between. Getting this wrong is the most expensive mistake on the page.',
      },
      {
        view: 'roles',
        href: '/roles',
        text: 'Now the roles, in plain English. Read the third line on each card. Nearly every briefing failure we see comes from confusing a service designer with a visual designer, or a delivery manager with a project manager.',
      },
      {
        view: 'people',
        href: '/people',
        text: 'Who we hold. Two different things matter: how much of someone is free, and whether they tend to stay. Somebody who has never lasted a full phase arrives without context and leaves before they can explain anything.',
      },
      {
        view: 'squads',
        href: '/squads',
        text: 'Now build one. Seven roles, empty. Fill them from the role rather than from whoever is free. That distinction is the difference between a team and a group of available people.',
      },
      {
        view: 'squads-weak',
        href: '/squads?tour=6',
        text: 'Three roles filled. Watch the shape change: circle size is how much of a person the role needs, dashed is empty, amber is filled but below the datum. Filled-but-weak looks solved, which makes it more dangerous than an empty seat.',
      },
      {
        view: 'squads-unevidenced',
        href: '/squads?tour=7',
        text: 'Carys has no delivery evidence recorded at all, so her bracket is dashed and her multiplier stays at exactly 1.00. That is a gap in our records, never a mark against her. Say this out loud in a client room; it is the thing sceptics test first.',
      },
      {
        view: 'assurance',
        href: '/assurance',
        text: 'Finally, what it means for the assessment. Points at risk that close by changing who is on the team rather than by changing any process. Accessibility is the one that needs a hire.',
      },
    ],
  },

  teach: {
    toggle: 'Explain as I go',
    practiceIdea: {
      tag: 'Start here',
      title: 'The one idea underneath all of it',
      body: [
        'A delivery team is not a group of specialists borrowed from departments and pointed at a job. It is a small, fixed group that holds every skill the problem needs, and that is allowed to decide how to solve it.',
        'There is a simple test. Can this team put something in front of real users this week without asking anyone outside it for permission? If the answer is no, the team is not empowered, and no amount of stand-ups, sprints or burndown charts will change that.',
      ],
    },
    twoClocks: {
      tag: 'Why it matters',
      title: 'What goes wrong when the two clocks get confused',
      body: [
        'Squeeze them together and you get one of two failures. Either the team builds what the gate wants rather than what users need, and fails its service assessment. Or the team stops moving while it waits for governance, and burns a third of the budget on nothing.',
      ],
    },
    capacityCaution: {
      tag: 'A caution',
      title: 'Where this goes wrong in practice',
      body: [
        'The 20% band is always the first thing cut when a date is under pressure. It is also the band that produces almost everything an assurance review asks for. Cutting it feels free in month one and is expensive at the gate.',
      ],
    },
    rolesHowToRead: {
      tag: 'How to read these',
      title: 'The third line is the useful one',
      body: [
        'Most people can guess roughly what a role does. The mistakes come from the “commonly mistaken for” line. If you brief a service designer expecting a visual designer, or a delivery manager expecting a project manager, you will get the wrong work and it will take a month to notice.',
      ],
    },
    peopleLookingAt: {
      tag: 'What you are looking at',
      title: 'Free time and staying power are different things',
      body: [
        'Somebody being available does not make them a good addition. A person who has never stayed with one engagement for a full phase will be quick to assign and slow to help, because they arrive without the context and leave before they can explain anything to a reviewer.',
        'That is what staying power is for. Fragmented is not a criticism of the person. It is usually a description of how we have been allocating them.',
      ],
    },
    whatYouAreDoing: {
      tag: 'What you are doing',
      title: 'Filling roles, not booking people',
      body: [
        'Start from the role and ask who fits it, rather than starting from who is free. Those two approaches produce very different teams, and the second one is how organisations end up with a squad made entirely of whoever finished something last week.',
        'The number beside each person is a fit between 0 and 1. The vertical line at 0.60 is the datum: below it, the role is not safely filled, whatever the person’s job title says.',
      ],
    },
    assessment: {
      tag: 'What an assessment actually is',
      title: 'A panel asking a team to explain itself',
      body: [
        'A service assessment is not a document review. It is three or four experienced people spending half a day with the team, asking how decisions were made and who made them. Teams fail not because the service is bad but because nobody in the room can explain why it is the way it is.',
        'That is why the person who was there for the whole phase matters more than the person with the best CV.',
      ],
    },
    portfolioUse: {
      tag: 'How to use this page',
      title: 'Recruit against the pattern, not the emergency',
      body: [
        'A single engagement short of a researcher is a staffing problem. Four engagements short of the same role is a capability problem, and hiring one contractor for the loudest engagement will not touch it. This page exists to tell those two situations apart.',
      ],
    },
    nothingRecorded:
      'Nothing recorded. We hold no delivery evidence about this person, so their multiplier stays at exactly 1.00 and their figure is skills alone. This is a gap in our own records. It is never treated as a mark against them.',
    derived: 'from our records',
    asserted: 'recorded by a person',
  },

  roles: {
    eyebrow: 'Roles',
    title: 'Who does what, in plain English',
    lede: 'Nine roles you will see across our squads. Each card says what the role is for, what goes wrong without it, and what it is commonly mistaken for. No jargon and no acronyms.',
    withoutLabel: 'Without one',
    mistakenLabel: 'Commonly mistaken for',
    discoveryTitle: 'Which roles a discovery needs',
    colRole: 'Role',
    colHowMuch: 'How much',
    colEssential: 'How essential',
    colIfLeftOut: 'If you leave it out',
    cards: [
      {
        id: 'dm',
        title: 'Delivery manager',
        group: 'Product and delivery',
        what: 'Clears the path so the team can work. Removes blockers, unpicks approvals, chases the decision that is holding everyone up.',
        without: 'The team spends its week waiting: for access, for a decision, for someone to reply. Progress looks slow and nobody can say why.',
        not: 'Not a taskmaster and not a project manager. The team decides how the work gets done. The delivery manager removes whatever is stopping them.',
      },
      {
        id: 'pm',
        title: 'Product manager',
        group: 'Product and delivery',
        what: 'Decides what gets built and why, and says no to the rest. Owns whether the thing was worth doing.',
        without: 'Everything is a priority, so nothing is. The team builds whoever shouted loudest, and the service does several jobs badly.',
        not: 'Not the person who writes the requirements and hands them over. They set the problem and the team works out the answer.',
      },
      {
        id: 'ur',
        title: 'User researcher',
        group: 'User-centred design',
        what: 'Finds out what people actually need by watching them try to do the thing, rather than asking what they want.',
        without: 'You build what the organisation assumes. Assessment panels spot this in minutes, and so do users, more expensively.',
        not: 'Not a survey writer and not market research. This is observation of real people attempting real tasks.',
      },
      {
        id: 'sd',
        title: 'Service designer',
        group: 'User-centred design',
        what: 'Designs the whole journey end to end, including the parts that are not a screen: the letter, the phone call, the office visit.',
        without: 'You get a good website bolted onto a broken process. The digital bit works and the service still fails.',
        not: 'Not a visual designer. Very little of this job is what something looks like.',
      },
      {
        id: 'cd',
        title: 'Content designer',
        group: 'User-centred design',
        what: 'Writes what people read, and decides the order they read it in. In a public service, the words largely are the service.',
        without: 'Users cannot complete the task even when the technology works. In Wales this also breaches statutory language duties.',
        not: 'Not a copywriter and not marketing. Closer to a translator between government and everybody else.',
      },
      {
        id: 'ta',
        title: 'Technical architect',
        group: 'Architecture',
        what: 'Makes the big technical decisions and writes down why, so the next team is not guessing in two years’ time.',
        without: 'Decisions get made accidentally, by whoever was on the ticket. Nobody can explain the shape of the system to a gateway review.',
        not: 'Not the person who draws a diagram and leaves. They stay with the team and the decisions are testable.',
      },
      {
        id: 'ba',
        title: 'Business analyst',
        group: 'Product and delivery',
        what: 'Maps how the work is done today, including the spreadsheets and the workarounds nobody admits to.',
        without: 'The new service is designed for the process on paper rather than the one people actually run.',
        not: 'Not a requirements gatherer. The job is understanding, not transcription.',
      },
      {
        id: 'pa',
        title: 'Performance analyst',
        group: 'Data',
        what: 'Decides what success looks like in numbers, before anything is built, and then measures whether it happened.',
        without: 'You cannot tell whether the service worked. Benefits claimed in the business case stay unproven.',
        not: 'Not a reporting function. If they arrive after launch, they arrived too late to define the baseline.',
      },
      {
        id: 'as',
        title: 'Accessibility specialist',
        group: 'User-centred design',
        what: 'Makes sure the service works for people using screen readers, magnification, voice control, or no mouse.',
        without: 'A legal obligation is missed and roughly one in five users is excluded. This is the single most common assessment failure.',
        not: 'Not a checklist run at the end. Retrofitting accessibility costs several times what building it in costs.',
      },
    ],
  },

  figures: {
    label: 'Figure {n}.',
    empowered:
      'The same five people, arranged two ways. On the left they are one team with one problem and the authority to decide. On the right they are five individuals on loan, each answering to a different manager, so every decision has to travel upwards before it can travel forward. The second shape is more common and it is the single biggest cause of slow delivery.',
    empoweredAria:
      'Two team shapes compared: an empowered team that decides for itself, and a matrixed group reporting to five separate managers.',
    clocks:
      'Work runs on two clocks. The delivery clock is the team’s fortnightly rhythm. The governance clock is the gates and business cases underneath. They meet at the end of each phase and are independent in between. Gates never set the sprint, and sprints never wait for a gate.',
    clocksAria:
      'Delivery lifecycle: discovery, alpha, beta, live, with a governance gate at the end of each.',
    capacity:
      'A full-time person is not five days of new work. Seventy per cent goes to committed delivery, twenty to the things that keep delivery possible at all, and ten stays genuinely uncommitted. Plan at 100% and the discretionary work still happens, just unpaid and after hours, and the evidence quality is the first thing to suffer.',
    capacityAria:
      'Capacity split: 70 per cent committed delivery, 20 per cent discretionary, 10 per cent slack.',
    continuity:
      'Four phases of history, one row per person. A filled block means they stayed with one engagement for that whole phase. Read across: unbroken runs are what let somebody explain a decision to a gateway review a year later. Gaps are where the story breaks.',
    continuityAria:
      'Continuity chart. Filled blocks show phases each person stayed with one engagement.',
    squadShape:
      'The shape of the squad as it stands. Circle size is how much of a person the role needs. Dashed outlines are unfilled. Amber outlines are filled but sitting below the datum, which is a different problem from an empty seat and usually a more dangerous one, because it looks solved.',
    squadShapeAria:
      'Squad shape: circle size shows how much of a person the role needs. Dashed circles are unfilled.',
    demand:
      'What the book of work needs against what we hold, in full-time equivalents. Survey pink is demand, ink is capability. Accessibility is the one to act on: demand across four engagements and nobody at all, which is also the most common reason services fail assessment.',
    demandAria: 'Demand against capability held, by role.',
  },

  walkthrough: {
    openSeat: 'open',
    rolesFilled: 'Roles filled',
    aboveDatum: '{count} above the datum',
    essentialAtRisk: 'Essential roles at risk',
    essentialAtRiskNote: 'empty or below the line',
    stayingPower: 'Team staying power',
    stayingPowerNote: 'average across those assigned',
    readyToConfirm: 'Ready to confirm',
    yes: 'Yes',
    no: 'No',
    readyYes: 'every essential role is covered',
    readyNo: 'essential roles outstanding',
    rolesHeading: 'The seven roles',
    action: 'Action',
    bestAvailableNamed: 'best available: {name}, {score}',
    bestAvailableNamedShort: 'best available: {name}, {score} (not enough free time)',
    assignName: 'Assign {name}',
    seeAll: 'See all',
    change: 'Change',
    confirm: 'Confirm this squad',
    startAgain: 'Start again',
    coverEssential: 'Cover every essential role before confirming.',
    confirmHint: 'Confirming records who decided, and why, against each role.',
    confirmedTitle: '{filled} of {total} roles filled, {above} above the datum.',
    confirmedBody:
      'What happens next. The people are allocated at the stated FTE, the figures are snapshotted as they stand today, and the reasoning is stored against each role. If somebody asks in nine months why this team was chosen, the answer is already written down.',
    confirmedOutstanding:
      'Still outstanding. No accessibility specialist exists anywhere in the pool. That is a recruitment decision, not an assignment one, and it will surface at the assessment.',
    personMeta: '{role} · {free} FTE free',
    candidateMeta: 'skills {skill} · what we have seen them do ×{evidence}',
    candidateMetaShort: 'skills {skill} · what we have seen them do ×{evidence} · not enough free time',
    candidateMetaUnev: 'skills {skill} · nothing recorded',
    candidateMetaUnevShort: 'skills {skill} · nothing recorded · not enough free time',
    assignToRole: 'Assign to this role',
    remove: 'Remove',
    liveHint: 'The walkthrough below is a teaching squad. It is not saved against an engagement.',
  },

  footer: {
    disclaimer:
      'Demonstration build using the Government Digital and Data Profession Capability Framework, published under the Open Government Licence. Advisory instrument. Not a hiring decision.',
    demonstration: 'Demonstration build',
    representative: 'Representative data only',
  },

  legend: {
    held: 'skill held at the level needed',
    partial: 'held, but below the level needed',
    absent: 'skill not held',
    datum: 'the datum, 0.60',
    bracket: 'delivery evidence, dashed when we hold none',
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
