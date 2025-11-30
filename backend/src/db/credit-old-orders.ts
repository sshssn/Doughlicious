import "dotenv/config"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { prisma } from "./client"
import { LoyaltyService } from "../services/loyalty.service"

// Load .env from root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootEnvPath = path.resolve(__dirname, "../../../.env")
const localEnvPath = path.resolve(__dirname, "../../../.env.local")

dotenv.config({ path: rootEnvPath })
dotenv.config({ path: localEnvPath, override: false })

async function creditOldOrders() {
  console.log("Starting to credit loyalty points for old orders...")

  try {
    // Find all orders that are paid (have stripeId or status is in_process/completed)
    // and don't have loyalty rewards yet
    const paidOrders = await prisma.order.findMany({
      where: {
        OR: [
          { stripeId: { not: null } },
          { status: { in: ["in_process", "completed", "fulfilled"] } }
        ],
        status: { not: "cancelled" }
      },
      include: {
        user: true,
        items: true
      },
      orderBy: {
        createdAt: "asc"
      }
    })

    console.log(`Found ${paidOrders.length} paid orders to check`)

    let credited = 0
    let skipped = 0
    let errors = 0

    for (const order of paidOrders) {
      try {
        // Check if points were already awarded for this order
        const orderNumber = order.orderNumber || order.id.substring(0, 8)
        const existingAward = await prisma.loyaltyHistory.findFirst({
          where: {
            userId: order.userId,
            reason: { contains: `Order #${orderNumber}` }
          }
        })

        if (existingAward) {
          console.log(`  ✓ Order ${orderNumber} already has loyalty points`)
          skipped++
          continue
        }

        // Award 1 Dough per dollar spent on subtotal (rounded down), if subtotal >= 9.99
        const subtotal = order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0)
        const points = subtotal >= 9.99 ? Math.floor(subtotal) : 0

        if (points > 0) {
          await LoyaltyService.award(
            {
              id: order.user.id,
              clerkId: order.user.clerkId,
              email: order.user.email,
              role: order.user.role as any
            },
            points,
            `Order #${orderNumber} - ${points} Dough earned (retroactive)`
          )
          console.log(`  ✓ Credited ${points} points to ${order.user.email} for order ${orderNumber} (subtotal: £${subtotal.toFixed(2)})`)
          credited++
        } else {
          console.log(`  - Order ${orderNumber} has subtotal £${subtotal.toFixed(2)} (below £9.99 minimum), skipping`)
          skipped++
        }
      } catch (error) {
        console.error(`  ✗ Error processing order ${order.orderNumber || order.id}:`, error)
        errors++
      }
    }

    console.log("\n=== Summary ===")
    console.log(`Total orders checked: ${paidOrders.length}`)
    console.log(`Credited: ${credited}`)
    console.log(`Skipped (already credited): ${skipped}`)
    console.log(`Errors: ${errors}`)
    console.log("\nDone!")

  } catch (error) {
    console.error("Fatal error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

creditOldOrders()





