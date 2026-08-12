-- AlterTable
ALTER TABLE "Engagement" ADD COLUMN     "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "clientOrg" TEXT,
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'bid',
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "phase" TEXT NOT NULL DEFAULT 'discovery',
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "revision" TEXT NOT NULL DEFAULT 'A',
ADD COLUMN     "sector" TEXT,
ADD COLUMN     "serviceDescription" TEXT,
ADD COLUMN     "serviceName" TEXT;

-- CreateTable
CREATE TABLE "catalog_standards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "licence" TEXT NOT NULL,
    "attribution" TEXT NOT NULL,
    "sourceUrl" TEXT,

    CONSTRAINT "catalog_standards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_standard_versions" (
    "id" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'current',
    "changeNote" TEXT,

    CONSTRAINT "catalog_standard_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criteria" (
    "id" TEXT NOT NULL,
    "standardVersionId" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "guidanceUrl" TEXT,
    "phases" TEXT[],
    "statutory" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterion_translations" (
    "id" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "reviewStatus" TEXT NOT NULL DEFAULT 'human',

    CONSTRAINT "criterion_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_standards" (
    "engagementId" TEXT NOT NULL,
    "standardVersionId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "engagement_standards_pkey" PRIMARY KEY ("engagementId","standardVersionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalog_standards_code_key" ON "catalog_standards"("code");

-- CreateIndex
CREATE INDEX "catalog_standard_versions_standardId_idx" ON "catalog_standard_versions"("standardId");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_standard_versions_standardId_version_key" ON "catalog_standard_versions"("standardId", "version");

-- CreateIndex
CREATE INDEX "criteria_standardVersionId_idx" ON "criteria"("standardVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "criteria_standardVersionId_ref_key" ON "criteria"("standardVersionId", "ref");

-- CreateIndex
CREATE INDEX "criterion_translations_criterionId_idx" ON "criterion_translations"("criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "criterion_translations_criterionId_locale_key" ON "criterion_translations"("criterionId", "locale");

-- CreateIndex
CREATE INDEX "engagement_standards_standardVersionId_idx" ON "engagement_standards"("standardVersionId");

-- CreateIndex
CREATE INDEX "Engagement_orgId_idx" ON "Engagement"("orgId");

-- CreateIndex
CREATE INDEX "Engagement_reference_idx" ON "Engagement"("reference");

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_standard_versions" ADD CONSTRAINT "catalog_standard_versions_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "catalog_standards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criteria" ADD CONSTRAINT "criteria_standardVersionId_fkey" FOREIGN KEY ("standardVersionId") REFERENCES "catalog_standard_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_translations" ADD CONSTRAINT "criterion_translations_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_standards" ADD CONSTRAINT "engagement_standards_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_standards" ADD CONSTRAINT "engagement_standards_standardVersionId_fkey" FOREIGN KEY ("standardVersionId") REFERENCES "catalog_standard_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
