-- Engagement maturity level (Delivery Playbook doc 09 §10)

ALTER TABLE "Engagement" ADD COLUMN IF NOT EXISTS "maturityLevel" TEXT NOT NULL DEFAULT 'practising';
