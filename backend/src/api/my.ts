import { validateSession } from "../services/auth.service"
import { prisma } from "../db/client"

export async function myKpis(sessionToken: string) {
  const user = await validateSession(sessionToken)
  const [ordersCount, spendAgg, loyaltyAgg] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.aggregate({ where: { userId: user.id }, _sum: { totalAmount: true } }),
    prisma.loyaltyHistory.aggregate({ where: { userId: user.id }, _sum: { pointsDelta: true } })
  ])
  return { data: { ordersCount, totalSpent: Number(spendAgg._sum.totalAmount ?? 0), loyaltyPoints: Number(loyaltyAgg._sum.pointsDelta ?? 0) } }
}