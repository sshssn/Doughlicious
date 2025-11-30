import type { User } from "./auth.service"
import { prisma } from "../db/client"
import { randomBytes } from "crypto"

export type OrderItem = { id: string; orderId: string; productId: string; quantity: number; unitPrice: number }
export type Order = { id: string; orderNumber: string | null; userId: string; status: string; totalAmount: number; stripeId: string | null; createdAt: Date; deliveryMethod?: string | null; pickupTime?: Date | null; pickupLocation?: string | null; deliveryFee?: number | null }

function generateOrderNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '') // HHMMSS
  const shortId = randomBytes(4).toString('hex').toUpperCase().slice(0, 6) // 6 char hex
  return `DOUGH-${date}-${time}-${shortId}`
}

export const OrdersService = {
  async createOrder(user: User, payload: { items: Array<{ productId: string; quantity: number }>; pointsToRedeem?: number; deliveryMethod?: string; pickupTime?: string; pickupLocation?: string }): Promise<Order> {
    const ids = payload.items.map(i => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: ids }, isActive: true } })
    const items = payload.items.map(i => {
      const p = products.find(pp => pp.id === i.productId)
      if (!p) throw new Error("ProductNotFound")
      return { productId: i.productId, quantity: i.quantity, unitPrice: Number(p.price) }
    })
    let totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

    let deliveryFee = 0
    // Delivery Fee Logic: £1.99 if subtotal < 9.99 and method is delivery
    if (payload.deliveryMethod === 'delivery' && totalAmount < 9.99) {
      deliveryFee = 1.99
      totalAmount += deliveryFee
    }

    // Apply points redemption discount (10 points = £1 discount)
    let pointsRedeemed = 0
    // Minimum order value (subtotal) to redeem points is 9.99
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

    if (payload.pointsToRedeem && payload.pointsToRedeem > 0 && subtotal >= 9.99) {
      const { LoyaltyService } = await import("./loyalty.service")
      const balance = await LoyaltyService.getBalance(user.id)
      // Calculate max redeemable: can't redeem more than balance, and discount can't exceed order total
      const maxDiscount = totalAmount
      const maxPointsForDiscount = Math.floor(maxDiscount * 10) // 10 points per £1
      const pointsToRedeem = Math.min(payload.pointsToRedeem, balance, maxPointsForDiscount)

      if (pointsToRedeem > 0) {
        const discountAmount = pointsToRedeem / 10 // 10 points = £1
        totalAmount = Math.max(0, totalAmount - discountAmount) // Ensure total doesn't go negative
        pointsRedeemed = pointsToRedeem

        // NOTE: Points are NOT deducted here - they will be deducted when payment succeeds
        // This prevents losing points if the user cancels the checkout
      }
    }

    const orderNumber = generateOrderNumber()
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber,
        status: "created",
        totalAmount,
        pointsRedeemed: pointsRedeemed > 0 ? pointsRedeemed : null,
        deliveryMethod: payload.deliveryMethod,
        pickupTime: payload.pickupTime ? new Date(payload.pickupTime) : null,
        pickupLocation: payload.pickupLocation,
        deliveryFee,
        items: {
          create: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice }))
        }
      },
      include: { items: true }
    })
    return { id: order.id, orderNumber: order.orderNumber, userId: order.userId, status: order.status, totalAmount: Number(order.totalAmount), stripeId: order.stripeId ?? null, createdAt: order.createdAt, deliveryMethod: order.deliveryMethod, pickupTime: order.pickupTime, pickupLocation: order.pickupLocation, deliveryFee: order.deliveryFee ? Number(order.deliveryFee) : 0 }
  },
  async markPaid(orderId: string): Promise<void> {
    await prisma.order.update({ where: { id: orderId }, data: { status: "in_process" } })
  },
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "cancelled" }
    })
  }
}