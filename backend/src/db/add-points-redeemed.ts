import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addPointsRedeemedColumn() {
    console.log('Adding pointsRedeemed column to Order table...')

    const sql = `
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
  `

    const { data, error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
        console.error('Error executing SQL:', error)
        console.log('\n⚠️  The RPC function might not exist. Please run this SQL manually in Supabase SQL Editor:')
        console.log('\n' + sql)
        process.exit(1)
    }

    console.log('✅ Successfully added pointsRedeemed column!')
}

addPointsRedeemedColumn()
