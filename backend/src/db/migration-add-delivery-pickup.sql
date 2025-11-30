-- Add delivery and pickup fields to Order table
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "deliveryMethod" TEXT,
ADD COLUMN IF NOT EXISTS "pickupTime" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "pickupLocation" TEXT,
ADD COLUMN IF NOT EXISTS "deliveryFee" DECIMAL(10,2) DEFAULT 0;
