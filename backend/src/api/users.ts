import { validateSession } from "../services/auth.service"
import { prisma } from "../db/client"
import { LoyaltyService } from "../services/loyalty.service"

export async function listUsers(sessionToken: string) {
    const user = await validateSession(sessionToken)
    if (user.role !== "admin") throw new Error("Forbidden")
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } })
    return {
        data: users.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            createdAt: u.createdAt
        }))
    }
}

export async function creditUserPoints(sessionToken: string, userId: string, payload: { points: number; reason?: string }) {
    const admin = await validateSession(sessionToken)
    if (admin.role !== "admin") throw new Error("Forbidden")
    
    if (!payload.points || payload.points === 0) {
        throw new Error("Points must be a non-zero number")
    }
    
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) throw new Error("UserNotFound")
    
    const reason = payload.reason || `Manual credit by admin ${admin.email}`
    
    const history = await LoyaltyService.award(
        {
            id: targetUser.id,
            clerkId: targetUser.clerkId,
            email: targetUser.email,
            role: targetUser.role as any
        },
        payload.points,
        reason
    )
    
    return {
        data: {
            success: true,
            pointsAwarded: payload.points,
            newBalance: await LoyaltyService.getBalance(userId),
            history
        }
    }
}
