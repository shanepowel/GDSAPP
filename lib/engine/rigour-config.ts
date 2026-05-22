export const RIGOUR_DIMENSIONS = [
  {
    key: 'cadence_and_flow',
    label: 'Cadence and flow',
    descriptors: [
      'No visible agile cadence or retros that change behaviour.',
      'Cadence exists but is inconsistent; retros rarely change practice.',
      'Regular planning and stand-ups; some evidence of learning from retros.',
      'Strong flow with reviews and retros that alter priorities.',
      'Exemplary cadence; delivery rhythm and learning are documented and sustained.',
    ],
  },
  {
    key: 'research_in_delivery',
    label: 'User research integrated into delivery',
    descriptors: [
      'Research is absent or disconnected from the backlog.',
      'Research happens but rarely influences prioritisation.',
      'Research informs some backlog decisions with light traceability.',
      'Research routinely drives backlog changes with clear evidence.',
      'Research is embedded in every iteration with documented impact on decisions.',
    ],
  },
  {
    key: 'iteration_evidence',
    label: 'Iteration evidence',
    descriptors: [
      'No traceable changes from learning.',
      'Occasional changes claimed without clear history.',
      'Some version history and examples of response to feedback.',
      'Frequent, evidenced iteration linked to user or performance data.',
      'Rich change history showing learning loops at each phase.',
    ],
  },
  {
    key: 'governance_fit',
    label: 'Decision and governance fit',
    descriptors: [
      'Governance is absent or misaligned with risk.',
      'Heavy or ad hoc governance with poor traceability.',
      'Proportionate governance exists but is unevenly applied.',
      'Lightweight, traceable decisions matched to risk.',
      'Exemplary proportionate governance with clear decision records.',
    ],
  },
  {
    key: 'spend_and_gates',
    label: 'Spend control and assessment alignment',
    descriptors: [
      'Team unaware of spend controls or assessment gates.',
      'Awareness partial; preparation for gates is weak.',
      'Team understands gates and is preparing evidence.',
      'Clear preparation for spend and assessment milestones.',
      'Demonstrated track record of passing gates with aligned spend control.',
    ],
  },
  {
    key: 'team_stability',
    label: 'Team stability and multidisciplinary balance',
    descriptors: [
      'High churn or critical discipline gaps.',
      'Stability risks and thin coverage in key disciplines.',
      'Stable core with some gaps or churn risk flagged.',
      'Stable multidisciplinary team with sustainable resourcing.',
      'Highly stable team with documented succession and balance.',
    ],
  },
  {
    key: 'risk_management',
    label: 'Risk and dependency management maturity',
    descriptors: [
      'Risks and dependencies not managed.',
      'Lists exist but owners and actions are weak.',
      'Risks tracked with some active management.',
      'Risks and dependencies owned with regular review.',
      'Mature risk practice with escalation paths and dependency tracking.',
    ],
  },
] as const;

export type RigourDimensionKey = (typeof RIGOUR_DIMENSIONS)[number]['key'];
