export interface HandoverSection {
  id: string;
  title: string;
  body: string;
}

/** Play B handover and training content (also in docs/handover/). */
export const HANDOVER_SECTIONS: HandoverSection[] = [
  {
    id: 'overview',
    title: '1. What NRW owns (Play B)',
    body: `This instance is a **client assurance** deployment. Natural Resources Wales (or your authority) operates it to:

- Set consistent expectations for teams on framework call-offs
- Assure readiness against the Digital Service Standard for Wales (or GDS where applicable)
- Track evidence and agile rigour across services
- **Not** to score or view competitor suppliers' confidential submissions

Amplified (or your delivery partner) builds and hands over the method, training, and initial configuration. Ongoing operation is yours.

**Conflict firewall:** Supplier staff use a separate **internal** deployment for winning call-offs. That instance must never receive another supplier's bid data. This instance must never be used by a supplier to inspect competitors.`,
  },
  {
    id: 'admin',
    title: '2. Administration and access',
    body: `**Users:** Invite administrators via your identity process (credentials demo today; Entra ID for production).

**Organisation:** All engagements belong to one tenant. Do not share login with suppliers.

**Data:** Pseudonyms are supported for individuals. A DPIA is recommended when storing named people.

**Environment variables (your hosting):**
- \`DEPLOYMENT_MODE=client\` and \`NEXT_PUBLIC_DEPLOYMENT_MODE=client\` on this deployment only
- Neon \`DATABASE_URL\` (pooled) and \`DIRECT_URL\` (direct) on a database **you** control
- \`AUTH_SECRET\` and \`AUTH_URL\` for your public URL

Run migrations once: \`npm run db:provision\` from a trusted machine with your \`.env\`.`,
  },
  {
    id: 'portfolio',
    title: '3. Portfolio assurance (daily use)',
    body: `Open **Portfolio** for the cross-service dashboard:

- Mean readiness and rigour across engagements
- Statutory and pass/fail risks highlighted
- Drill into any service for detail, evidence, and criteria mapping

**Workflow for a new call-off:**
1. Create an **Engagement** per service (or per major call-off)
2. Set **Requirement** phase (discovery, alpha, beta, live)
3. Record the **Team** (roles, skills, vacancies allowed)
4. Register **Evidence** and link to standard points
5. Complete **Agile rigour** assessment
6. Enter **Assurance criteria** (scored questions from the call-off specification)
7. **Run analysis** and export the report

Use advisory outputs to support panel or governance decisions, not as automated pass/fail on suppliers.`,
  },
  {
    id: 'boundaries',
    title: '4. Data boundaries and conflicts',
    body: `| Rule | Rationale |
|------|-----------|
| NRW operates this instance | Capability uplift, not supplier dependency |
| Suppliers use their own internal instance | Avoid seeing competitors' submissions |
| No competitor bid uploads here | Prevents taint of mini-competitions |
| Human approval on all draft text | AI scaffolds are advisory only |
| Explainable scores only | Panels and auditors can show working |

If a supplier also delivers capability uplift to NRW, contractual terms must state they do **not** administer this assurance instance or access its data for competitive purposes.`,
  },
  {
    id: 'training',
    title: '5. Training session (90 minutes)',
    body: `**Suggested agenda for NRW digital and procurement leads:**

| Time | Topic |
|------|--------|
| 0–15 | Purpose: assurance vs supplier tooling; conflict rules |
| 15–30 | Portfolio dashboard and engagement model |
| 30–50 | Live exercise: NRW discovery scenario (Welsh language + wellbeing gaps) |
| 50–65 | Evidence register and rigour dimensions |
| 65–80 | Mapping call-off criteria; reading outlook and gaps |
| 80–90 | Handover: support, framework updates, contacts |

**Exercise:** Use the seeded NRW regulatory permitting discovery engagement. Run analysis. Discuss one statutory gap (Welsh language) and one rigour weakness. Agree what evidence would close the gap before mobilisation.

**Materials:** This in-app pack, repository docs/NRW-FRAMEWORK-STRATEGY.md, printed report from **Export report**.`,
  },
  {
    id: 'support',
    title: '6. After handover',
    body: `**NRW owns:** Framework version updates, user access, engagement data, operating the assurance cycle on each call-off.

**Delivery partner (optional):** Coaching on dependency map changes, DDaT ingest refresh, major releases.

**Not included in handover:** Running mini-competitions on behalf of suppliers, accessing supplier-internal deployments, or automated tender PDF ingestion (roadmap).

Keep \`DEPLOYMENT_MODE=client\` on every production deploy of this URL. Create a second Vercel project with \`DEPLOYMENT_MODE=internal\` only on supplier networks if needed.`,
  },
];
