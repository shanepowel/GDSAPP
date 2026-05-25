-- Organisation deployment mode (Play A / Play B firewall)
ALTER TABLE "Organisation" ADD COLUMN "deploymentMode" TEXT NOT NULL DEFAULT 'internal';

-- Multi-reviewer approval chains
CREATE TABLE "ReviewRequest" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "minApprovals" INTEGER NOT NULL DEFAULT 2,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReviewAssignment" (
    "id" TEXT NOT NULL,
    "reviewRequestId" TEXT NOT NULL,
    "reviewerUserId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "comment" TEXT,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "ReviewAssignment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ReviewRequest" ADD CONSTRAINT "ReviewRequest_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_reviewRequestId_fkey" FOREIGN KEY ("reviewRequestId") REFERENCES "ReviewRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
