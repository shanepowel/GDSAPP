-- CreateTable
CREATE TABLE "assurance_frameworks" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "version" TEXT,
    "licence" TEXT,
    "attribution" TEXT,

    CONSTRAINT "assurance_frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assurance_framework_items" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "question" TEXT,
    "parentRef" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "packRef" TEXT,

    CONSTRAINT "assurance_framework_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crosswalk_mappings" (
    "id" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "frameworkItemId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "note" TEXT,
    "authoredBy" TEXT NOT NULL,
    "reviewedBy" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crosswalk_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assurance_frameworks_code_key" ON "assurance_frameworks"("code");

-- CreateIndex
CREATE INDEX "assurance_framework_items_frameworkId_idx" ON "assurance_framework_items"("frameworkId");

-- CreateIndex
CREATE INDEX "assurance_framework_items_packRef_idx" ON "assurance_framework_items"("packRef");

-- CreateIndex
CREATE UNIQUE INDEX "assurance_framework_items_frameworkId_ref_key" ON "assurance_framework_items"("frameworkId", "ref");

-- CreateIndex
CREATE INDEX "crosswalk_mappings_criterionId_idx" ON "crosswalk_mappings"("criterionId");

-- CreateIndex
CREATE INDEX "crosswalk_mappings_frameworkItemId_idx" ON "crosswalk_mappings"("frameworkItemId");

-- CreateIndex
CREATE UNIQUE INDEX "crosswalk_mappings_criterionId_frameworkItemId_key" ON "crosswalk_mappings"("criterionId", "frameworkItemId");

-- AddForeignKey
ALTER TABLE "assurance_framework_items" ADD CONSTRAINT "assurance_framework_items_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "assurance_frameworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crosswalk_mappings" ADD CONSTRAINT "crosswalk_mappings_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crosswalk_mappings" ADD CONSTRAINT "crosswalk_mappings_frameworkItemId_fkey" FOREIGN KEY ("frameworkItemId") REFERENCES "assurance_framework_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
