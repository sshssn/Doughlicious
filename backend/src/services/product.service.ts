import type { User } from "./auth.service"
import { prisma } from "../db/client"

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  stock: number
  isActive: boolean
  packSize: number | null
}

export const ProductsService = {
  async getAll(filters?: {
    search?: string
    minPrice?: number
    maxPrice?: number
    category?: string
  }): Promise<Product[]> {
    const whereConditions: any[] = [{ isActive: true }]

    // Search filter - search in name and description (case-insensitive)
    if (filters?.search && filters.search.trim()) {
      whereConditions.push({
        OR: [
          { name: { contains: filters.search.trim(), mode: "insensitive" } },
          { description: { contains: filters.search.trim(), mode: "insensitive" } }
        ]
      })
    }

    // Price range filter
    const priceFilter: any = {}
    if (filters?.minPrice !== undefined) {
      priceFilter.gte = filters.minPrice
    }
    if (filters?.maxPrice !== undefined) {
      priceFilter.lte = filters.maxPrice
    }
    if (Object.keys(priceFilter).length > 0) {
      whereConditions.push({ price: priceFilter })
    }

    // Category filter
    if (filters?.category) {
      whereConditions.push({ category: filters.category })
    }

    const where = whereConditions.length > 1 ? { AND: whereConditions } : whereConditions[0]

    const rows = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" }
    })
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      price: Number(r.price),
      category: r.category,
      imageUrl: r.imageUrl,
      stock: r.stock,
      isActive: r.isActive,
      packSize: r.packSize
    }))
  },

  async getAllAdmin(): Promise<Product[]> {
    const rows = await prisma.product.findMany({ orderBy: { name: "asc" } })
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      price: Number(r.price),
      category: r.category,
      imageUrl: r.imageUrl,
      stock: r.stock,
      isActive: r.isActive,
      packSize: r.packSize
    }))
  },

  async getCategories(): Promise<string[]> {
    const categories = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"]
    })
    return categories.map(c => c.category).sort()
  }
}