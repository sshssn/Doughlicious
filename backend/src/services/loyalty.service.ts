import type { User } from "./auth.service"
import { prisma } from "../db/client"

export type LoyaltyHistory = { id: string; userId: string; pointsDelta: number; reason: string; createdAt: Date }

export const LoyaltyService = {
  async award(user: User, pointsDelta: number, reason: string): Promise<LoyaltyHistory> {
    const history = await prisma.loyaltyHistory.create({
      data: {
        userId: user.id,
        pointsDelta,
        reason,
      }
    })
    return {
      id: history.id,
      userId: history.userId,
      pointsDelta: history.pointsDelta,
      reason: history.reason,
      createdAt: history.createdAt
    }
  },
  
  async getBalance(userId: string): Promise<number> {
    const result = await prisma.loyaltyHistory.aggregate({
      where: { userId },
      _sum: { pointsDelta: true }
    })
    return result._sum.pointsDelta ?? 0
  },
  
  async getHistory(userId: string, limit: number = 50) {
    return prisma.loyaltyHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit
    })
  }
}