-- Org insights cache (doc 08) — additive only

CREATE TABLE "org_insights_cache" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "inputsHash" TEXT NOT NULL,
    "insights" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_insights_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "org_insights_cache_orgId_key" ON "org_insights_cache"("orgId");

ALTER TABLE "org_insights_cache" ADD CONSTRAINT "org_insights_cache_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
