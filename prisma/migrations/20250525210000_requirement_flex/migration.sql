-- Requirement flexibility priority for reasoning engine
ALTER TABLE "Requirement" ADD COLUMN "flexPriority" TEXT NOT NULL DEFAULT 'balanced';
