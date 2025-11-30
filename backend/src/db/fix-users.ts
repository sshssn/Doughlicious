import { prisma } from "./client"
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

/**
 * Script to fix users in database:
 * 1. Check for users with missing emails
 * 2. Check for users that should be admin
 * 3. List all users and their status
 */

async function fixUsers() {
  console.log("🔍 Checking users in database...\n")
  
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  })
  
  console.log(`Found ${users.length} users in database\n`)
  
  let issuesFound = 0
  
  for (const user of users) {
    const issues: string[] = []
    
    // Check for missing email
    if (!user.email || user.email.trim() === "" || user.email.includes("@temp.local")) {
      issues.push("❌ Missing or invalid email")
    }
    
    // Check for admin users
    if (user.role === "admin") {
      console.log(`✅ ADMIN: ${user.email || "NO EMAIL"} (ID: ${user.id}, ClerkID: ${user.clerkId})`)
    } else {
      console.log(`👤 Customer: ${user.email || "NO EMAIL"} (ID: ${user.id}, ClerkID: ${user.clerkId})`)
    }
    
    if (issues.length > 0) {
      issuesFound++
      console.log(`   Issues: ${issues.join(", ")}`)
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total users: ${users.length}`)
  console.log(`   Admin users: ${users.filter(u => u.role === "admin").length}`)
  console.log(`   Customer users: ${users.filter(u => u.role === "customer").length}`)
  console.log(`   Users with issues: ${issuesFound}`)
  
  if (issuesFound > 0) {
    console.log(`\n⚠️  Some users have issues. You may need to:`)
    console.log(`   1. Set admin role directly in database for: sshssn@yahoo.com`)
    console.log(`   2. Ensure Clerk webhook is configured`)
    console.log(`   3. Users will be fixed on next login`)
  }
  
  await prisma.$disconnect()
}

fixUsers().catch(console.error)

