import Stripe from "stripe"
import { ENV } from "../lib/env"
import { prisma } from "../db/client"
import { OrdersService } from "../services/order.service"
import { LoyaltyService } from "../services/loyalty.service"

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY())

export async function handleStripeWebhook(rawBody: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET as string
  const event = stripe.webhooks.constructEvent(rawBody, signature, secret)

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // Verify payment was actually successful
    if (session.payment_status !== "paid") {
      console.warn(`Checkout session ${session.id} completed but payment_status is ${session.payment_status}`)
      return { ok: true }
    }

    // Try to find order by stripeId first, then fallback to metadata.orderId
    let order = await prisma.order.findFirst({
      where: { stripeId: session.id },
      include: { items: true }
    })

    // Fallback: try to find by orderId from metadata
    if (!order && session.metadata?.orderId) {
      order = await prisma.order.findUnique({
        where: { id: session.metadata.orderId },
        include: { items: true }
      })
    }

    if (order) {
      // Award loyalty points IMMEDIATELY when payment is confirmed (regardless of order status)
      // This ensures points are credited as soon as payment is good
      const user = await prisma.user.findUnique({ where: { id: order.userId } })
      if (user) {
        // Check if points were already awarded for this order to prevent duplicates
        const orderNumber = order.orderNumber || order.id.substring(0, 8)
        const existingAward = await prisma.loyaltyHistory.findFirst({
          where: {
            userId: user.id,
            reason: { contains: `Order #${orderNumber}` }
          }
        })

        if (!existingAward) {
          // Award 1 Dough per dollar spent (rounded down) on subtotal, if subtotal >= 9.99
          const subtotal = order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0)
          const points = subtotal >= 9.99 ? Math.floor(subtotal) : 0
          if (points > 0) {
            try {
              await LoyaltyService.award(
                { id: user.id, clerkId: user.clerkId, email: user.email, role: user.role as any },
                points,
                `Order #${orderNumber} - ${points} Dough earned`
              )
              console.log(`Loyalty points awarded: ${points} points to user ${user.id} for order ${order.id}`)
            } catch (error) {
              console.error(`Failed to award loyalty points for order ${order.id}:`, error)
              // Continue processing even if loyalty points fail
            }
          }
        } else {
          console.log(`Loyalty points already awarded for order ${order.id}`)
        }

        // Deduct redeemed points ONLY when payment is successful
        if ((order as any).pointsRedeemed && (order as any).pointsRedeemed > 0) {
          const pointsRedeemed = Number((order as any).pointsRedeemed)
          try {
            await LoyaltyService.award(
              { id: user.id, clerkId: user.clerkId, email: user.email, role: user.role as any },
              -pointsRedeemed,
              `Points redeemed for order #${orderNumber}`
            )
            console.log(`Deducted ${pointsRedeemed} points from user ${user.id} for order ${order.id}`)
          } catch (error) {
            console.error(`Failed to deduct points for order ${order.id}:`, error)
            // Continue processing even if points deduction fails
          }
        }
      }

      // Update order status and stock (only if order is still in pending/created status)
      if (order.status === "pending" || order.status === "created") {
        await OrdersService.markPaid(order.id)

        // Update stock
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          })
        }
      } else {
        console.log(`Order ${order.id} already processed with status: ${order.status}`)
      }
    } else {
      console.warn(`Order not found for checkout session ${session.id}`)
    }
  }

  // Handle failed payment
  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session

    // Try to find order by stripeId first, then fallback to metadata.orderId
    let order = await prisma.order.findFirst({
      where: { stripeId: session.id }
    })

    // Fallback: try to find by orderId from metadata
    if (!order && session.metadata?.orderId) {
      order = await prisma.order.findUnique({
        where: { id: session.metadata.orderId }
      })
    }

    if (order) {
      // Only cancel if order is still in pending/created status
      if (order.status === "pending" || order.status === "created") {
        await OrdersService.cancelOrder(order.id, "Payment method failed")
        console.log(`Order ${order.id} cancelled due to failed payment`)
      }
    } else {
      console.warn(`Order not found for failed checkout session ${session.id}`)
    }
  }

  // Handle payment intent failure (additional safety net)
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    // Try to find the checkout session from the payment intent
    if (paymentIntent.metadata?.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: paymentIntent.metadata.orderId }
      })

      if (order && (order.status === "pending" || order.status === "created")) {
        await OrdersService.cancelOrder(order.id, "Payment failed")
        console.log(`Order ${order.id} cancelled due to payment intent failure`)
      }
    }
  }

  return { ok: true }
}