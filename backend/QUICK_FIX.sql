-- Quick fix: Add pointsRedeemed column to Order table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)

-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Order' AND column_name = 'pointsRedeemed';

-- If the above returns no rows, run this:
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pointsRedeemed" INTEGER DEFAULT 0;

-- Verify it was added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'Order' AND column_name = 'pointsRedeemed';
