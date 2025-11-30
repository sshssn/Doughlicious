import { ProductsService } from "../services/product.service"
import { prisma } from "../db/client"
import { ProductCreateSchema, ProductUpdateSchema } from "../lib/validation"
import { validateSession } from "../services/auth.service"

export async function getProducts(sessionToken: string, queryParams?: {
  search?: string
  minPrice?: string
  maxPrice?: string
  category?: string
}) {
  const filters = queryParams ? {
    search: queryParams.search,
    minPrice: queryParams.minPrice ? parseFloat(queryParams.minPrice) : undefined,
    maxPrice: queryParams.maxPrice ? parseFloat(queryParams.maxPrice) : undefined,
    category: queryParams.category
  } : undefined

  const products = await ProductsService.getAll(filters)
  return { data: products }
}

export async function getAdminProducts(sessionToken: string) {
  const user = await validateSession(sessionToken)
  if (user.role !== "admin") throw new Error("Forbidden")
  const products = await ProductsService.getAllAdmin()
  return { data: products }
}

export async function getProduct(sessionToken: string, id: string) {
  // Public endpoint - no auth required to view products
  const p = await prisma.product.findUnique({ where: { id } })
  if (!p || (!p.isActive)) throw new Error("NotFound")
  return { data: { id: p.id, name: p.name, description: p.description, price: Number(p.price), category: p.category, imageUrl: p.imageUrl, stock: p.stock, isActive: p.isActive, packSize: p.packSize } }
}

export async function createProduct(sessionToken: string, payload: unknown) {
  const user = await validateSession(sessionToken)
  if (user.role !== "admin") throw new Error("Forbidden")
  const data = ProductCreateSchema.parse(payload)
  const product = await prisma.product.create({ data })
  return { data: product }
}

export async function updateProduct(sessionToken: string, id: string, payload: unknown) {
  const user = await validateSession(sessionToken)
  if (user.role !== "admin") throw new Error("Forbidden")
  const data = ProductUpdateSchema.parse(payload)
  const product = await prisma.product.update({ where: { id }, data })
  return { data: product }
}

export async function deleteProduct(sessionToken: string, id: string) {
  const user = await validateSession(sessionToken)
  if (user.role !== "admin") throw new Error("Forbidden")
  await prisma.product.delete({ where: { id } })
  return { ok: true }
}

export async function getCategories() {
  const categories = await ProductsService.getCategories()
  return { data: categories }
}