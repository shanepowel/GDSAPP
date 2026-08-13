-- AlterTable
ALTER TABLE "fit_scores" ADD COLUMN "frameworkVersion" TEXT NOT NULL DEFAULT 'unversioned';

-- CreateTable
CREATE TABLE "skill_aliases" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "note" TEXT,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "skill_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capability_framework_pins" (
    "id" TEXT NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "sourceDate" TIMESTAMP(3) NOT NULL,
    "rolesCsvHash" TEXT,
    "skillsCsvHash" TEXT,
    "sourceFiles" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capability_framework_pins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skill_aliases_alias_key" ON "skill_aliases"("alias");

-- CreateIndex
CREATE INDEX "skill_aliases_skillId_idx" ON "skill_aliases"("skillId");

-- CreateIndex
CREATE INDEX "capability_framework_pins_importedAt_idx" ON "capability_framework_pins"("importedAt");

-- AddForeignKey
ALTER TABLE "skill_aliases" ADD CONSTRAINT "skill_aliases_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
