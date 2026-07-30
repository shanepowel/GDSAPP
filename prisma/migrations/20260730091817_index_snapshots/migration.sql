-- CreateTable
CREATE TABLE "index_snapshots" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" INTEGER,
    "breakdown" JSONB NOT NULL,
    "cause" TEXT,

    CONSTRAINT "index_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "index_snapshots_engagementId_computedAt_idx" ON "index_snapshots"("engagementId", "computedAt");

-- AddForeignKey
ALTER TABLE "index_snapshots" ADD CONSTRAINT "index_snapshots_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
