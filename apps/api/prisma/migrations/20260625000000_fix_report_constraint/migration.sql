-- This migration documents manual changes already applied to the database
-- AlterTable
ALTER TABLE "report_cal" ADD COLUMN IF NOT EXISTS "assetType" TEXT;
ALTER TABLE "report_cal" ADD COLUMN IF NOT EXISTS "deptId" INTEGER;

-- The old unique index was already dropped manually
-- The new unique index was already created manually
-- These are no-ops since changes exist in DB already
