import "dotenv/config"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { prisma } from "./client"
import fs from "fs"

// Load .env from root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootEnvPath = path.resolve(__dirname, "../../../.env")
const localEnvPath = path.resolve(__dirname, "../../../.env.local")

dotenv.config({ path: rootEnvPath })
dotenv.config({ path: localEnvPath, override: false })

async function runMigration() {
    console.log("Running delivery/pickup migration...")

    try {
        const sqlPath = path.join(__dirname, "migration-add-delivery-pickup.sql")
        const sql = fs.readFileSync(sqlPath, "utf-8")

        console.log("Executing SQL:")
        console.log(sql)

        await prisma.$executeRawUnsafe(sql)

        console.log("✓ Migration completed successfully!")
    } catch (error) {
        console.error("✗ Migration failed:", error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

runMigration()
