# Framework reconciliation

**Owner:** practice lead (capability framework). Not a software-only job.

The product scores people against the [Government Digital and Data Profession Capability Framework](https://ddat-capability-framework.service.gov.uk/) (spoken shorthand: DDaT). That taxonomy changes roughly quarterly. A fit figure computed against a skill that has since been renamed is unexplainable unless we pin the version and keep old ids resolving.

## What already happens on ingest

`npm run ingest` (`scripts/ingest-ddat.ts`) reads `data/source/roles.csv` and `data/source/skills.csv` (optional `change-notes.csv`, optional `VERSION`). It:

1. Upserts roles, levels and skills. It does **not** delete skills that have left the latest CSV, so historic fit breakdowns still have a row to join.
2. Records `SkillAlias` rows when a CSV column or change-notes file names a previous skill.
3. Writes a `CapabilityFrameworkPin` with the source date, CSV hashes, and a version label (`VERSION` file, else the CSV mtime date).
4. Team Fit recomputes store that pin's `versionLabel` on every `FitScore.frameworkVersion` alongside `scoringVersion`.

`lib/framework/resolve-skill.ts` maps a stored skill id through aliases to the current skill. A renamed skill still opens to a name; a removed skill stays explainable as the id that was scored.

## Cadence

When the framework publishes a change (typical months: February, May, August, November):

1. Download the published CSVs. Pin them in `data/source/` and set `data/source/VERSION` to the publication date (`YYYY-MM-DD`).
2. Run `npm run ingest` against a copy of production-shaped data. Confirm a new `CapabilityFrameworkPin` row.
3. Diff skills: added, renamed, merged, removed. For each rename or merge, confirm a `SkillAlias` exists (add a `change-notes.csv` row if the published files do not carry the old name).
4. Open every system archetype (`settings/archetypes`). Update any `requiredSkills` that reference a removed skill. Historic `FitScore` rows stay as computed; they are not rewritten.
5. Recompute Team Fit on active engagements only after archetypes are updated. Old scores remain valid against the `frameworkVersion` they carry.
6. Note the pin date in the release. If a figure on screen was computed on a previous pin, the UI already has copy for framework drift (`copy.errors.frameworkDrift`).

## Do not

- Delete a `Skill` row because it left the latest CSV.
- Recompute historic scores onto the new taxonomy without recording that the inputs changed.
- Treat “DDaT” as the formal name in product copy, report headers, or the public Practice pages. Keep it as an alias only.

## Why this is somebody’s job

The framework is someone else’s taxonomy. If reconciliation has no named owner it quietly rots: archetypes point at vanished skills, and the promise that every number opens to its reasoning fails. The practice lead owns the content decision; engineering owns the ingest and the alias table.
