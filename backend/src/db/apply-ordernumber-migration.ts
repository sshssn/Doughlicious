import "dotenv/config"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { prisma } from "./client"

// Load .env from root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootEnvPath = path.resolve(__dirname, "../../.env")
const localEnvPath = path.resolve(__dirname, "../../.env.local")

dotenv.config({ path: rootEnvPath })
dotenv.config({ path: localEnvPath, override: false })

async function applyMigration() {
  console.log("🔧 Applying orderNumber migration...\n")
  
  try {
    // Check if column already exists
    const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Order' AND column_name = 'orderNumber'
    `
    
    if (result.length > 0) {
      console.log("✅ orderNumber column already exists in Order table")
      await prisma.$disconnect()
      return
    }
    
    console.log("📝 Adding orderNumber column to Order table...")
    
    // Add the column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Order" 
      ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
    `)
    
    console.log("📝 Creating unique index on orderNumber...")
    
    // Create unique index
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");
    `)
    
    console.log("✅ Migration applied successfully!")
    console.log("\nThe orderNumber column has been added to the Order table.")
    
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message)
    if (error.message.includes("already exists")) {
      console.log("✅ Column or index already exists - migration not needed")
    } else {
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()
  .catch((error) => {
    console.error("\n❌ Error:", error)
    process.exit(1)
  })




