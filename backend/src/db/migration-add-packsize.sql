-- Migration to add packSize column to Product table
-- Run this in your Supabase SQL editor or via Prisma migrate

ALTER TABLE "Product" 
ADD COLUMN IF NOT EXISTS "packSize" INTEGER DEFAULT 1;

-- Update existing products to have packSize = 1 (single donut)
UPDATE "Product" SET "packSize" = 1 WHERE "packSize" IS NULL;

