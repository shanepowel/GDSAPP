/**
 * Minimal DDaT fixture rows when official CSVs are not present.
 * Covers slugs referenced by standards-dependency-map for demo and reconciliation.
 */
import fs from 'fs';
import path from 'path';

const FIXTURE_ROLES = `role family,role,role description,role level,role level description,skill name,skill description,skill level,skill level description,role type
Delivery,Service owner,Owns the service,Associate,Associate service owner,Strategic ownership,Owns outcomes,working,,
Delivery,Service owner,Owns the service,Associate,Associate service owner,Stakeholder relationship management,Manages stakeholders,practitioner,,
Delivery,Service owner,Owns the service,Associate,Associate service owner,Life-cycle management,Manages lifecycle,working,,
Delivery,Service owner,Owns the service,Associate,Associate service owner,Agile and Lean practices,Awareness,awareness,,
User research,User researcher,Researches users,Working,Working level,User research,Plans and runs research,practitioner,,
User research,User researcher,Researches users,Working,Working level,User-centred practice and advocacy,Advocates for users,working,,
User research,User researcher,Researches users,Working,Working level,Defining and managing user and business needs,Needs,working,,
User research,User researcher,Researches users,Working,Working level,Applying user-centred insights,Insights,working,,
Design,Content designer,Designs content,Working,Working level,Content design,Writes content,practitioner,,
Design,Content designer,Designs content,Working,Working level,Designing for everyone,Inclusive design,working,,
Design,Accessibility specialist,Accessibility expert,Working,Working level,Designing for everyone,Inclusive design,practitioner,,
Design,Interaction designer,Designs interactions,Working,Working level,Iterative design,Iterates,practitioner,,
Design,Service designer,Service design,Working,Working level,Designing strategically,Strategic,working,,
Delivery,Delivery manager,Runs delivery,Working,Working level,Agile and Lean practices,Agile delivery,working,,
Delivery,Product manager,Owns product,Working,Working level,Agile and Lean practices,Agile delivery,working,,
Delivery,Product manager,Owns product,Working,Working level,Product management,Product,working,,
`;

export function ensureFixtureCsvs() {
  const dir = path.join(process.cwd(), 'data', 'source');
  fs.mkdirSync(dir, { recursive: true });
  const rolesPath = path.join(dir, 'roles.csv');
  if (!fs.existsSync(rolesPath)) {
    fs.writeFileSync(rolesPath, FIXTURE_ROLES);
    console.log('Wrote fixture data/source/roles.csv');
  }
}
