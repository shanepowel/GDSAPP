-- CreateTable
CREATE TABLE "FrameworkVersion" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "FrameworkVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "strength" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceLink" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "pointId" TEXT,
    "questionId" TEXT,
    "roleLevelId" TEXT,

    CONSTRAINT "EvidenceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonAvailability" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "availableFrom" TIMESTAMP(3),
    "daysPerWeek" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "dayRate" DOUBLE PRECISION,

    CONSTRAINT "PersonAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Constraint" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "budgetCap" DOUBLE PRECISION,
    "startBy" TIMESTAMP(3),
    "endBy" TIMESTAMP(3),
    "internalRatePerDay" DOUBLE PRECISION,
    "partnerRatePerDay" DOUBLE PRECISION,

    CONSTRAINT "Constraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RigourAssessment" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessedBy" TEXT,

    CONSTRAINT "RigourAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RigourDimensionScore" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "evidenceNote" TEXT,

    CONSTRAINT "RigourDimensionScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "route" TEXT,
    "qualityWeight" DOUBLE PRECISION NOT NULL,
    "priceWeight" DOUBLE PRECISION NOT NULL,
    "scoringScaleMax" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoredQuestion" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "passThreshold" INTEGER,
    "isPassFail" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,

    CONSTRAINT "ScoredQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionRoleDep" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "minSeniorityRank" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuestionRoleDep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionSkillDep" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "minLevel" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "QuestionSkillDep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionPointRef" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "pointId" TEXT NOT NULL,

    CONSTRAINT "QuestionPointRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionDraft" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "isScaffold" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuestionDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outcome" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "phase" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Outcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Judgement" (
    "id" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "frameworkVersionId" TEXT,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overrideReason" TEXT,
    "previousJudgementId" TEXT,

    CONSTRAINT "Judgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_token_key" ON "ShareLink"("token");

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "StandardPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ScoredQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonAvailability" ADD CONSTRAINT "PersonAvailability_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Constraint" ADD CONSTRAINT "Constraint_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigourAssessment" ADD CONSTRAINT "RigourAssessment_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigourDimensionScore" ADD CONSTRAINT "RigourDimensionScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "RigourAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoredQuestion" ADD CONSTRAINT "ScoredQuestion_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionRoleDep" ADD CONSTRAINT "QuestionRoleDep_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ScoredQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSkillDep" ADD CONSTRAINT "QuestionSkillDep_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ScoredQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionPointRef" ADD CONSTRAINT "QuestionPointRef_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ScoredQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionPointRef" ADD CONSTRAINT "QuestionPointRef_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "StandardPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionDraft" ADD CONSTRAINT "QuestionDraft_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ScoredQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Judgement" ADD CONSTRAINT "Judgement_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Judgement" ADD CONSTRAINT "Judgement_frameworkVersionId_fkey" FOREIGN KEY ("frameworkVersionId") REFERENCES "FrameworkVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
