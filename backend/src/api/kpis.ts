import { validateSession } from "../services/auth.service"
import { prisma } from "../db/client"

export async function kpis(sessionToken: string) {
  const user = await validateSession(sessionToken)
  if (user.role !== "admin") throw new Error("Forbidden")
  const [ordersCount, revenueAgg, lowStockCount, activeProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.product.count({ where: { stock: { lt: 10 }, isActive: true } }),
    prisma.product.count({ where: { isActive: true } })
  ])
  return { data: { ordersCount, revenue: Number(revenueAgg._sum.totalAmount ?? 0), lowStockCount, activeProducts } }
}