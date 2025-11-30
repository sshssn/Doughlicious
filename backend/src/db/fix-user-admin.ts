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
 * Script to fix a specific user's admin role and email
 * Usage: tsx src/db/fix-user-admin.ts
 */

async function fixUserAdmin() {
  const email = "sshssn@yahoo.com"
  
  console.log(`🔧 Fixing user: ${email}\n`)
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log(`❌ User not found with email: ${email}`)
      console.log(`\nAvailable users:`)
      const allUsers = await prisma.user.findMany()
      allUsers.forEach(u => {
        console.log(`  - ${u.email || "NO EMAIL"} (ID: ${u.id}, Role: ${u.role})`)
      })
      await prisma.$disconnect()
      return
    }
    
    console.log(`Found user:`)
    console.log(`  ID: ${user.id}`)
    console.log(`  ClerkID: ${user.clerkId}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Current Role: ${user.role}`)
    console.log(`  Created: ${user.createdAt}`)
    
    if (user.role === "admin") {
      console.log(`\n✅ User is already admin!`)
    } else {
      console.log(`\n🔄 Updating role to admin...`)
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: "admin" }
      })
      console.log(`✅ Updated! New role: ${updated.role}`)
    }
    
    // Check if email is missing
    if (!user.email || user.email.trim() === "" || user.email.includes("@temp.local")) {
      console.log(`\n🔄 Fixing email...`)
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { email }
      })
      console.log(`✅ Email fixed: ${updated.email}`)
    }
    
    console.log(`\n✅ User fixed successfully!`)
    console.log(`\nNext steps:`)
    console.log(`1. Sign out and sign back in`)
    console.log(`2. Visit /dashboard to access admin panel`)
    
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserAdmin()

