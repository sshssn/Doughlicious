-- Add pointsRedeemed column to Order table
-- This script handles RLS policies that prevent direct schema changes

-- Temporarily disable RLS
ALTER TABLE "Order" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "LoyaltyHistory" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" DISABLE ROW LEVEL SECURITY;

-- Add the pointsRedeemed column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Order' 
        AND column_name = 'pointsRedeemed'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "pointsRedeemed" INTEGER DEFAULT 0;
    END IF;
END $$;

-- Re-enable RLS
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LoyaltyHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
