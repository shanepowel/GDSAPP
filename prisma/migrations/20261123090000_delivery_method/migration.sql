-- Delivery method (Agile, Waterfall or Hybrid) sets the evidence cadence for an engagement.
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "deliveryMethod" TEXT;

-- Data and Analytics evidence pack, from the DAA Data & Analytics Playbook technical delivery checklist.
INSERT INTO "handbook_checklist_items" ("id", "stage", "itemKey", "title", "sortOrder") VALUES
  ('hcl-dp-1', 'data-pack', 'dap-requirements', 'Dashboard meets the client''s requirements and is easy to navigate', 1),
  ('hcl-dp-2', 'data-pack', 'dap-wireframe', 'Wireframe signed off by the client in development', 2),
  ('hcl-dp-3', 'data-pack', 'dap-quality', 'Source data quality assessed, with missing values and outliers handled', 3),
  ('hcl-dp-4', 'data-pack', 'dap-normalisation', 'Data normalised, with a clear naming convention for facts and dimensions', 4),
  ('hcl-dp-5', 'data-pack', 'dap-model', 'Data model follows a star schema with relationships set correctly', 5),
  ('hcl-dp-6', 'data-pack', 'dap-access', 'Row-level security and access groups set up and checked', 6),
  ('hcl-dp-7', 'data-pack', 'dap-environments', 'Separate development, test and production workspaces', 7),
  ('hcl-dp-8', 'data-pack', 'dap-testing', 'Unit, system integration and user acceptance testing signed off', 8),
  ('hcl-dp-9', 'data-pack', 'dap-versioning', 'Version history and backup in place, with CI/CD where available', 9),
  ('hcl-dp-10', 'data-pack', 'dap-dictionary', 'Data dictionary and data owners recorded', 10)
ON CONFLICT ("id") DO NOTHING;

-- Give existing data and reporting engagements the pack, unticked.
INSERT INTO "engagement_checklist_items" ("id", "engagementId", "stage", "itemKey", "title", "sortOrder", "done")
SELECT 'dp' || md5(e."id" || h."itemKey"), e."id", h."stage", h."itemKey", h."title", h."sortOrder", false
FROM "Engagement" e
CROSS JOIN "handbook_checklist_items" h
WHERE h."stage" = 'data-pack' AND e."squadShape" IN ('data', 'reporting')
ON CONFLICT ("engagementId", "itemKey") DO NOTHING;

-- The two demo engagements: a gated public sector discovery and an agile data platform.
UPDATE "Engagement" SET "deliveryMethod" = 'hybrid' WHERE "id" = 'nrw-demo' AND "deliveryMethod" IS NULL;
UPDATE "Engagement" SET "deliveryMethod" = 'agile' WHERE "id" = 'nrw-demo-2' AND "deliveryMethod" IS NULL;
