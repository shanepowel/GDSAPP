-- Add ceremony of origin on rigour signals so every composite can open to the ceremony that emitted the evidence.

ALTER TABLE "rigour_signals" ADD COLUMN "ceremony" TEXT;
