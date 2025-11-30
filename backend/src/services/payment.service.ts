import type { User } from "./auth.service"
import Stripe from "stripe"
import { ENV } from "../lib/env"
import { prisma } from "../db/client"
import { createClerkClient } from "@clerk/backend"

export const PaymentService = {
  async startCheckout(user: User, payload: { orderId: string }): Promise<{ url: string; sessionId: string }> {
    const stripe = new Stripe(ENV.STRIPE_SECRET_KEY())
    const order = await prisma.order.findUnique({ where: { id: payload.orderId }, include: { items: { include: { product: true } } } })
    if (!order) throw new Error("OrderNotFound")
    if (order.userId !== user.id) throw new Error("Forbidden")

    // Calculate line items - use order's totalAmount (which already has discount applied)
    // Adjust line items proportionally to match the discounted total
    const orderTotal = Number(order.totalAmount)
    const itemsSubtotal = order.items.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0)
    const hasDiscount = itemsSubtotal > orderTotal && orderTotal > 0

    let line_items
    if (hasDiscount && itemsSubtotal > 0) {
      // Apply discount proportionally to each item
      const discountRatio = orderTotal / itemsSubtotal
      line_items = order.items.map(i => {
        const adjustedPrice = Number(i.unitPrice) * discountRatio
        return {
          price_data: {
            currency: "gbp",
            product_data: {
              name: i.product.name,
              description: i.product.description || undefined,
            },
            unit_amount: Math.round(adjustedPrice * 100)
          },
          quantity: i.quantity
        }
      })
    } else {
      // No discount, use regular line items
      line_items = order.items.map(i => ({
        price_data: {
          currency: "gbp",
          product_data: {
            name: i.product.name,
            description: i.product.description || undefined,
          },
          unit_amount: Math.round(Number(i.unitPrice) * 100)
        },
        quantity: i.quantity
      }))
    }

    const idempotencyKey = `checkout_${order.id}_${user.id}`

    // Get email from database user if not in token
    let customerEmail = user.email
    let customerName = ""

    if (!customerEmail || customerEmail.trim() === "") {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
      if (dbUser && dbUser.email) {
        customerEmail = dbUser.email
      }
    }

    // Get user name from Clerk
    try {
      const clerk = createClerkClient({ secretKey: ENV.CLERK_SECRET_KEY() })
      const clerkUser = await clerk.users.getUser(user.clerkId)
      if (clerkUser.firstName || clerkUser.lastName) {
        customerName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim()
      }
    } catch (error) {
      console.warn("Failed to fetch user name from Clerk:", error)
    }

    try {
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        line_items,
        metadata: {
          orderId: order.id,
          userId: user.id,
          pointsRedeemed: (order as any).pointsRedeemed?.toString() || "0",
        },
        success_url: `${process.env.SUCCESS_URL ?? "http://localhost:3000/cart?success=true"}`,
        cancel_url: `${process.env.CANCEL_URL ?? "http://localhost:3000/cart?canceled=true"}`,
        billing_address_collection: "auto" as const, // Optional billing address collection
        // Prepopulate customer email and name
        customer_email: customerEmail && customerEmail.trim() !== "" ? customerEmail : undefined,
      }

      // Add customer name to metadata if available
      if (customerName) {
        sessionConfig.metadata = {
          ...sessionConfig.metadata,
          customerName: customerName,
        }
      }

      // Log the config for debugging (remove sensitive data in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating Stripe checkout session with config:', {
          ...sessionConfig,
          customer_email: sessionConfig.customer_email ? '[REDACTED]' : undefined,
        })
      }

      const session = await stripe.checkout.sessions.create(sessionConfig, { idempotencyKey })

      await prisma.order.update({ where: { id: order.id }, data: { stripeId: session.id, status: "pending" } })

      if (!session.url) {
        throw new Error("Stripe session URL not generated")
      }

      return { url: session.url, sessionId: session.id }
    } catch (error) {
      console.error("Stripe checkout error:", error)
      throw new Error(`Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}