-- AlterTable
ALTER TABLE "Engagement" ADD COLUMN     "designBinding" TEXT NOT NULL DEFAULT 'live',
ADD COLUMN     "designScenarioId" TEXT,
ADD COLUMN     "designSnapshotId" TEXT,
ADD COLUMN     "designSyncedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DesignEntity" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "purpose" TEXT,
    "domain" TEXT,
    "accountabilities" JSONB NOT NULL DEFAULT '[]',
    "policies" JSONB NOT NULL DEFAULT '[]',
    "parentId" TEXT,
    "ddatRoleId" TEXT,
    "ddatRoleLevelId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignRelationship" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignPerson" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "fte" INTEGER NOT NULL DEFAULT 100,
    "skills" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignAssignment" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "allocation" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignComment" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Guest',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignActivity" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignSnapshot" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignScenario" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "engagementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignShareLink" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT,
    "snapshotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DesignEntity_orgId_idx" ON "DesignEntity"("orgId");

-- CreateIndex
CREATE INDEX "DesignRelationship_orgId_idx" ON "DesignRelationship"("orgId");

-- CreateIndex
CREATE INDEX "DesignPerson_orgId_idx" ON "DesignPerson"("orgId");

-- CreateIndex
CREATE INDEX "DesignAssignment_orgId_idx" ON "DesignAssignment"("orgId");

-- CreateIndex
CREATE INDEX "DesignComment_orgId_idx" ON "DesignComment"("orgId");

-- CreateIndex
CREATE INDEX "DesignComment_entityId_idx" ON "DesignComment"("entityId");

-- CreateIndex
CREATE INDEX "DesignActivity_orgId_idx" ON "DesignActivity"("orgId");

-- CreateIndex
CREATE INDEX "DesignSnapshot_orgId_idx" ON "DesignSnapshot"("orgId");

-- CreateIndex
CREATE INDEX "DesignScenario_orgId_idx" ON "DesignScenario"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "DesignShareLink_token_key" ON "DesignShareLink"("token");

-- CreateIndex
CREATE INDEX "DesignShareLink_orgId_idx" ON "DesignShareLink"("orgId");

-- AddForeignKey
ALTER TABLE "DesignEntity" ADD CONSTRAINT "DesignEntity_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignRelationship" ADD CONSTRAINT "DesignRelationship_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignPerson" ADD CONSTRAINT "DesignPerson_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignAssignment" ADD CONSTRAINT "DesignAssignment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignComment" ADD CONSTRAINT "DesignComment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignActivity" ADD CONSTRAINT "DesignActivity_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignSnapshot" ADD CONSTRAINT "DesignSnapshot_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignScenario" ADD CONSTRAINT "DesignScenario_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignShareLink" ADD CONSTRAINT "DesignShareLink_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
