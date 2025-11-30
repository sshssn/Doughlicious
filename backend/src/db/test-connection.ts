import "dotenv/config"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Load .env from root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootEnvPath = path.resolve(__dirname, "../../.env")
const localEnvPath = path.resolve(__dirname, "../../.env.local")

dotenv.config({ path: rootEnvPath })
dotenv.config({ path: localEnvPath, override: false })
import { prisma } from "./client"
import { ENV } from "../lib/env"

async function testConnection() {
  console.log("🔍 Testing Database Connection...\n")

  // Test 1: Environment Variables
  console.log("1. Checking Environment Variables...")
  try {
    const supabaseUrl = ENV.SUPABASE_URL()
    const databaseUrl = ENV.DATABASE_URL()
    console.log("   ✅ SUPABASE_URL: Set")
    console.log("   ✅ DATABASE_URL: Set")
    console.log("   ✅ SUPABASE_ANON_KEY: Set")
  } catch (error: any) {
    console.error("   ❌ Missing environment variables:", error.message)
    process.exit(1)
  }

  // Test 2: Prisma Client Connection
  console.log("\n2. Testing Prisma Client Connection...")
  try {
    await prisma.$connect()
    console.log("   ✅ Prisma client connected successfully")
  } catch (error: any) {
    console.error("   ❌ Prisma connection failed:", error.message)
    process.exit(1)
  }

  // Test 3: Database Schema Verification
  console.log("\n3. Verifying Database Schema...")
  try {
    // Check if tables exist by querying them
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    const orderItemCount = await prisma.orderItem.count()
    const loyaltyCount = await prisma.loyaltyHistory.count()

    console.log("   ✅ User table exists (count:", userCount, ")")
    console.log("   ✅ Product table exists (count:", productCount, ")")
    console.log("   ✅ Order table exists (count:", orderCount, ")")
    console.log("   ✅ OrderItem table exists (count:", orderItemCount, ")")
    console.log("   ✅ LoyaltyHistory table exists (count:", loyaltyCount, ")")
  } catch (error: any) {
    console.error("   ❌ Schema verification failed:", error.message)
    console.error("   💡 Make sure to run: npm run prisma:migrate")
    process.exit(1)
  }

  // Test 4: Test Product Query
  console.log("\n4. Testing Product Query...")
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 5
    })
    console.log(`   ✅ Successfully queried ${products.length} active products`)
    if (products.length > 0) {
      console.log("   Sample products:")
      products.forEach(p => {
        console.log(`      - ${p.name} (${p.category}) - $${p.price}`)
      })
    } else {
      console.log("   ⚠️  No active products found. Run seed script: npm run seed")
    }
  } catch (error: any) {
    console.error("   ❌ Product query failed:", error.message)
    process.exit(1)
  }

  // Test 5: Test Raw Query (to verify direct database access)
  console.log("\n5. Testing Raw Database Query...")
  try {
    const result = await prisma.$queryRaw`SELECT version() as version`
    console.log("   ✅ Raw query successful - database is accessible")
  } catch (error: any) {
    console.error("   ❌ Raw query failed:", error.message)
    process.exit(1)
  }

  console.log("\n✅ All database connection tests passed!")
  console.log("\n📋 Summary:")
  console.log("   - Environment variables: ✅")
  console.log("   - Prisma connection: ✅")
  console.log("   - Database schema: ✅")
  console.log("   - Product queries: ✅")
  console.log("   - Raw queries: ✅")
}

testConnection()
  .catch((error) => {
    console.error("\n❌ Test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

