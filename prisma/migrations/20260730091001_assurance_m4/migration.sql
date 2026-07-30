-- CreateTable
CREATE TABLE "capability_requirements" (
    "id" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "roleArchetype" TEXT,
    "minFte" INTEGER,
    "skillTags" TEXT[],
    "phasePersistent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "capability_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capability_links" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "capabilityRequirementId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "accountabilityIndex" INTEGER,
    "strength" TEXT NOT NULL DEFAULT 'satisfies',
    "note" TEXT,
    "provenance" TEXT NOT NULL DEFAULT 'human',
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "capability_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assurance_evidence" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "uri" TEXT,
    "storageKey" TEXT,
    "ownerPersonId" TEXT,
    "producedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "confidentiality" TEXT NOT NULL DEFAULT 'client',
    "provenance" TEXT NOT NULL DEFAULT 'manual',
    "sourceSystem" TEXT,
    "externalId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assurance_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_criteria" (
    "evidenceId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "strength" TEXT NOT NULL DEFAULT 'supports',

    CONSTRAINT "evidence_criteria_pkey" PRIMARY KEY ("evidenceId","criterionId")
);

-- CreateTable
CREATE TABLE "criterion_judgements" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "proposedBy" TEXT NOT NULL DEFAULT 'human',
    "proposedByUserId" TEXT,
    "aiModel" TEXT,
    "aiPromptHash" TEXT,
    "confirmedByUserId" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supersededById" TEXT,

    CONSTRAINT "criterion_judgements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterion_evidence_owners" (
    "engagementId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "criterion_evidence_owners_pkey" PRIMARY KEY ("engagementId","criterionId")
);

-- CreateIndex
CREATE INDEX "capability_requirements_criterionId_idx" ON "capability_requirements"("criterionId");

-- CreateIndex
CREATE INDEX "capability_links_engagementId_idx" ON "capability_links"("engagementId");

-- CreateIndex
CREATE INDEX "capability_links_capabilityRequirementId_idx" ON "capability_links"("capabilityRequirementId");

-- CreateIndex
CREATE INDEX "capability_links_entityId_idx" ON "capability_links"("entityId");

-- CreateIndex
CREATE INDEX "assurance_evidence_engagementId_idx" ON "assurance_evidence"("engagementId");

-- CreateIndex
CREATE INDEX "assurance_evidence_engagementId_expiresAt_idx" ON "assurance_evidence"("engagementId", "expiresAt");

-- CreateIndex
CREATE INDEX "criterion_judgements_engagementId_criterionId_supersededByI_idx" ON "criterion_judgements"("engagementId", "criterionId", "supersededById");

-- AddForeignKey
ALTER TABLE "capability_requirements" ADD CONSTRAINT "capability_requirements_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_links" ADD CONSTRAINT "capability_links_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_links" ADD CONSTRAINT "capability_links_capabilityRequirementId_fkey" FOREIGN KEY ("capabilityRequirementId") REFERENCES "capability_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assurance_evidence" ADD CONSTRAINT "assurance_evidence_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_criteria" ADD CONSTRAINT "evidence_criteria_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "assurance_evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_criteria" ADD CONSTRAINT "evidence_criteria_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_judgements" ADD CONSTRAINT "criterion_judgements_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_judgements" ADD CONSTRAINT "criterion_judgements_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_evidence_owners" ADD CONSTRAINT "criterion_evidence_owners_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_evidence_owners" ADD CONSTRAINT "criterion_evidence_owners_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
