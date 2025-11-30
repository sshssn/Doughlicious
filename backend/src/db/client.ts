import { PrismaClient } from "@prisma/client"

// Create a singleton Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient

try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
} catch (error: any) {
  if (error.message?.includes("Cannot find module") || error.message?.includes("@prisma/client")) {
    console.error("❌ Prisma client not generated. Please run: npm run prisma:generate")
    throw new Error("Prisma client not generated. Please run: npm run prisma:generate")
  }
  throw error
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaInstance
}

export const prisma = prismaInstance