-- Delivery spine: lifecycle facts the next-action rules read.
-- Checklist titles and thresholds are data, copied onto each engagement.

ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "commercialModel" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "marketSector" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "startsOn" TIMESTAMP(3);
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "endsOn" TIMESTAMP(3);
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "outcomes" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "squadShape" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "scopeClear" BOOLEAN;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "steeringChair" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "steeringFrequency" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "clientProductOwner" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "productOwnerDays" DOUBLE PRECISION;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "accountManagerName" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "changeThresholdGbp" INTEGER;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "deliveryStatus" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "deliveryStatusNote" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "deliveryStatusById" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "recoveryPlan" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "riskLockAt" TIMESTAMP(3);
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "steeringOn" TIMESTAMP(3);
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "steeringPackReady" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "goLiveOn" TIMESTAMP(3);
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "hasAftercare" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "reportDueOn" TIMESTAMP(3);
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "surveyDue" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "surveySentOn" TIMESTAMP(3);
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "charterReviewOn" TIMESTAMP(3);
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "charterAgreedOn" TIMESTAMP(3);
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "monthlyReportDraft" TEXT;
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "monthlyReportSubmittedAt" TIMESTAMP(3);
ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "leadNotifiedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "handbook_checklist_items" (
  "id" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "itemKey" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  CONSTRAINT "handbook_checklist_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "handbook_checklist_items_itemKey_key" ON "handbook_checklist_items"("itemKey");
CREATE INDEX IF NOT EXISTS "handbook_checklist_items_stage_idx" ON "handbook_checklist_items"("stage");

INSERT INTO "handbook_checklist_items" ("id", "stage", "itemKey", "title", "sortOrder") VALUES
  ('hcl-sz-1', 'sprint-zero', 'charter', 'Squad charter signed off', 1),
  ('hcl-sz-2', 'sprint-zero', 'governance', 'Client Product Owner and steering committee confirmed', 2),
  ('hcl-sz-3', 'sprint-zero', 'environments', 'Development, test and production environments ready with a first deployment', 3),
  ('hcl-sz-4', 'sprint-zero', 'pipeline', 'Pipeline running build, tests and security scan', 4),
  ('hcl-sz-5', 'sprint-zero', 'wiki', 'Wiki set up with the standard structure', 5),
  ('hcl-sz-6', 'sprint-zero', 'outcomes', 'Outcomes agreed with the Product Owner', 6),
  ('hcl-sz-7', 'sprint-zero', 'backlog', 'Backlog ready for two sprints', 7),
  ('hcl-sz-8', 'sprint-zero', 'spikes', 'Highest-risk spikes complete and recorded', 8),
  ('hcl-sz-9', 'sprint-zero', 'plan', 'Delivery Plan baselined and 30-day plan shared', 9),
  ('hcl-sz-10', 'sprint-zero', 'raid', 'RAID log opened', 10),
  ('hcl-sz-11', 'sprint-zero', 'change', 'Change control route agreed', 11)
ON CONFLICT ("id") DO NOTHING;

CREATE TABLE IF NOT EXISTS "handbook_config" (
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  CONSTRAINT "handbook_config_pkey" PRIMARY KEY ("key")
);

INSERT INTO "handbook_config" ("key", "value") VALUES
  ('compass.predictability.target', '80'),
  ('compass.quality.target', '1'),
  ('compass.health.target', '4'),
  ('compass.satisfaction.target', '4'),
  ('riskLock.hours', '48'),
  ('keel.maxEngagements', '1'),
  ('productOwner.minDays', '2')
ON CONFLICT ("key") DO NOTHING;

CREATE TABLE IF NOT EXISTS "engagement_checklist_items" (
  "id" TEXT NOT NULL,
  "engagementId" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "itemKey" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "done" BOOLEAN NOT NULL DEFAULT false,
  "doneAt" TIMESTAMP(3),
  "doneByUserId" TEXT,
  "ownerName" TEXT,
  "dueOn" TIMESTAMP(3),
  CONSTRAINT "engagement_checklist_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "engagement_checklist_items_engagementId_itemKey_key" ON "engagement_checklist_items"("engagementId", "itemKey");
CREATE INDEX IF NOT EXISTS "engagement_checklist_items_engagementId_idx" ON "engagement_checklist_items"("engagementId");
DO $$ BEGIN
  ALTER TABLE "engagement_checklist_items" ADD CONSTRAINT "engagement_checklist_items_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "engagement_milestones" (
  "id" TEXT NOT NULL,
  "engagementId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "dueOn" TIMESTAMP(3),
  "proves" TEXT,
  "paymentLinked" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'on-time',
  CONSTRAINT "engagement_milestones_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "engagement_milestones_engagementId_idx" ON "engagement_milestones"("engagementId");
DO $$ BEGIN
  ALTER TABLE "engagement_milestones" ADD CONSTRAINT "engagement_milestones_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "raid_items" (
  "id" TEXT NOT NULL,
  "engagementId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "ownerName" TEXT,
  "action" TEXT,
  "dueOn" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "raid_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "raid_items_engagementId_idx" ON "raid_items"("engagementId");
DO $$ BEGIN
  ALTER TABLE "raid_items" ADD CONSTRAINT "raid_items_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "change_requests" (
  "id" TEXT NOT NULL,
  "engagementId" TEXT NOT NULL,
  "ref" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "change_requests_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "change_requests_engagementId_ref_key" ON "change_requests"("engagementId", "ref");
CREATE INDEX IF NOT EXISTS "change_requests_engagementId_idx" ON "change_requests"("engagementId");
DO $$ BEGIN
  ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "decision_records" (
  "id" TEXT NOT NULL,
  "engagementId" TEXT NOT NULL,
  "forum" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "ownerName" TEXT,
  "decidedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "confirmedAt" TIMESTAMP(3),
  "confirmedById" TEXT,
  CONSTRAINT "decision_records_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "decision_records_engagementId_idx" ON "decision_records"("engagementId");
DO $$ BEGIN
  ALTER TABLE "decision_records" ADD CONSTRAINT "decision_records_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
