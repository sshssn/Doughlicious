import { validateSession } from "../services/auth.service"
import { OrdersService } from "../services/order.service"
import { prisma } from "../db/client"

export async function createOrder(sessionToken: string, payload: { items: Array<{ productId: string; quantity: number }>; pointsToRedeem?: number }) {
  const user = await validateSession(sessionToken)
  const order = await OrdersService.createOrder(user, payload)
  return { data: order }
}

export async function listOrders(sessionToken: string) {
  const user = await validateSession(sessionToken)
  if (user.role !== "admin") throw new Error("Forbidden")
  const orders = await prisma.order.findMany({ include: { items: true, user: true }, orderBy: { createdAt: "desc" } })
  return {
    data: orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      email: o.user.email,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      itemCount: o.items.length,
      createdAt: o.createdAt
    }))
  }
}

export async function listMyOrders(sessionToken: string) {
  const user = await validateSession(sessionToken)
  const orders = await prisma.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: "desc" } })
  return {
    data: orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      pointsRedeemed: o.pointsRedeemed ?? 0,
      itemCount: o.items.length,
      createdAt: o.createdAt
    }))
  }
}

export async function updateOrder(sessionToken: string, orderId: string, payload: { status: string }) {
  const user = await validateSession(sessionToken)
  if (user.role !== "admin") throw new Error("Forbidden")
  const order = await prisma.order.update({ where: { id: orderId }, data: { status: payload.status } })
  return { data: order }
}

export async function getOrder(sessionToken: string, orderId: string) {
  const user = await validateSession(sessionToken)
  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { 
      items: { 
        include: { product: true } 
      },
      user: true
    }
  })
  if (!order) throw new Error("OrderNotFound")
  // Users can only view their own orders, admins can view any
  if (user.role !== "admin" && order.userId !== user.id) throw new Error("Forbidden")
  
  return {
    data: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      pointsRedeemed: order.pointsRedeemed ?? 0,
      stripeId: order.stripeId,
      createdAt: order.createdAt.toISOString(),
      user: user.role === "admin" ? {
        firstName: null, // Clerk data not in DB
        lastName: null,
        email: order.user.email
      } : undefined,
      items: order.items.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          imageUrl: item.product.imageUrl
        },
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice)
      }))
    }
  }
}