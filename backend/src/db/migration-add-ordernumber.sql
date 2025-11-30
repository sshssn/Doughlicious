-- Add orderNumber column to Order table
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;

-- Create unique index on orderNumber
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");

