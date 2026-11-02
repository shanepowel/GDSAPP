-- CreateTable
CREATE TABLE "engagement_measures" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "predictability" DOUBLE PRECISION,
    "quality" DOUBLE PRECISION,
    "teamHealth" DOUBLE PRECISION,
    "clientSatisfaction" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_measures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "engagement_measures_engagementId_idx" ON "engagement_measures"("engagementId");

-- CreateIndex
CREATE UNIQUE INDEX "engagement_measures_engagementId_period_key" ON "engagement_measures"("engagementId", "period");

-- AddForeignKey
ALTER TABLE "engagement_measures" ADD CONSTRAINT "engagement_measures_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
