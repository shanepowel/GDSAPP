-- Team Fit (spec 07) — additive only

CREATE TABLE "role_archetypes" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "description" TEXT,
    "standardRefs" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "role_archetypes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "archetype_roles" (
    "id" TEXT NOT NULL,
    "archetypeId" TEXT NOT NULL,
    "ddatRoleId" TEXT NOT NULL,
    "displayTitle" TEXT NOT NULL,
    "minLevel" TEXT NOT NULL,
    "fteRequired" DOUBLE PRECISION NOT NULL,
    "criticality" TEXT NOT NULL DEFAULT 'core',
    "sortOrder" INTEGER NOT NULL,
    "requiredSkills" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "archetype_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rigour_signals" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "engagementId" TEXT,
    "type" TEXT NOT NULL,
    "provenance" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "evidenceId" TEXT,
    "note" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "confirmedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rigour_signals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "asserted_signal_requires_confirmation" CHECK (
      "provenance" <> 'asserted' OR "confirmedByUserId" IS NOT NULL
    )
);

CREATE TABLE "fit_scores" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "archetypeRoleId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "skillScore" DOUBLE PRECISION NOT NULL,
    "rigourMultiplier" DOUBLE PRECISION NOT NULL,
    "compositeScore" DOUBLE PRECISION NOT NULL,
    "band" TEXT NOT NULL,
    "breakdown" JSONB NOT NULL,
    "scoringVersion" TEXT NOT NULL,
    "inputsHash" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fit_scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "squad_proposals" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "archetypeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "confirmedByUserId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squad_proposals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "confirmed_proposal_requires_human" CHECK (
      "status" <> 'confirmed' OR "confirmedByUserId" IS NOT NULL
    )
);

CREATE TABLE "squad_assignments" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "archetypeRoleId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "fteAllocated" DOUBLE PRECISION NOT NULL,
    "fitScoreId" TEXT,
    "rationale" TEXT,
    "overrideReason" TEXT,

    CONSTRAINT "squad_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "capability_gaps" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "archetypeRoleId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "bestAvailableScore" DOUBLE PRECISION,
    "recommendation" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "standardRefs" JSONB NOT NULL DEFAULT '[]',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capability_gaps_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "role_archetypes_orgId_slug_version_key" ON "role_archetypes"("orgId", "slug", "version");
CREATE INDEX "role_archetypes_orgId_idx" ON "role_archetypes"("orgId");
CREATE INDEX "archetype_roles_archetypeId_idx" ON "archetype_roles"("archetypeId");
CREATE INDEX "rigour_signals_personId_idx" ON "rigour_signals"("personId");
CREATE INDEX "rigour_signals_orgId_idx" ON "rigour_signals"("orgId");
CREATE INDEX "rigour_signals_engagementId_idx" ON "rigour_signals"("engagementId");
CREATE UNIQUE INDEX "fit_scores_engagementId_archetypeRoleId_personId_key" ON "fit_scores"("engagementId", "archetypeRoleId", "personId");
CREATE INDEX "fit_scores_engagementId_archetypeRoleId_compositeScore_idx" ON "fit_scores"("engagementId", "archetypeRoleId", "compositeScore");
CREATE INDEX "squad_proposals_engagementId_idx" ON "squad_proposals"("engagementId");
CREATE INDEX "squad_assignments_proposalId_idx" ON "squad_assignments"("proposalId");
CREATE INDEX "capability_gaps_engagementId_idx" ON "capability_gaps"("engagementId");

ALTER TABLE "role_archetypes" ADD CONSTRAINT "role_archetypes_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "archetype_roles" ADD CONSTRAINT "archetype_roles_archetypeId_fkey" FOREIGN KEY ("archetypeId") REFERENCES "role_archetypes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rigour_signals" ADD CONSTRAINT "rigour_signals_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rigour_signals" ADD CONSTRAINT "rigour_signals_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "fit_scores" ADD CONSTRAINT "fit_scores_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fit_scores" ADD CONSTRAINT "fit_scores_archetypeRoleId_fkey" FOREIGN KEY ("archetypeRoleId") REFERENCES "archetype_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "squad_proposals" ADD CONSTRAINT "squad_proposals_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "squad_proposals" ADD CONSTRAINT "squad_proposals_archetypeId_fkey" FOREIGN KEY ("archetypeId") REFERENCES "role_archetypes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "squad_assignments" ADD CONSTRAINT "squad_assignments_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "squad_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "squad_assignments" ADD CONSTRAINT "squad_assignments_archetypeRoleId_fkey" FOREIGN KEY ("archetypeRoleId") REFERENCES "archetype_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "squad_assignments" ADD CONSTRAINT "squad_assignments_fitScoreId_fkey" FOREIGN KEY ("fitScoreId") REFERENCES "fit_scores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "capability_gaps" ADD CONSTRAINT "capability_gaps_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "capability_gaps" ADD CONSTRAINT "capability_gaps_archetypeRoleId_fkey" FOREIGN KEY ("archetypeRoleId") REFERENCES "archetype_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Weak-fit assignments require an override reason (subquery check via trigger).
CREATE OR REPLACE FUNCTION enforce_weak_fit_override()
RETURNS TRIGGER AS $$
DECLARE
  band_value TEXT;
BEGIN
  IF NEW."fitScoreId" IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW."overrideReason" IS NOT NULL AND length(trim(NEW."overrideReason")) > 0 THEN
    RETURN NEW;
  END IF;
  SELECT "band" INTO band_value FROM "fit_scores" WHERE "id" = NEW."fitScoreId";
  IF band_value IS NULL OR band_value IN ('strong', 'viable') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'weak_fit_requires_reason: stretch/gap assignments need overrideReason';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER squad_assignment_weak_fit
BEFORE INSERT OR UPDATE ON "squad_assignments"
FOR EACH ROW EXECUTE FUNCTION enforce_weak_fit_override();
