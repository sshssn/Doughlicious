import { z } from "zod"

// Custom validator for imageUrl - accepts URL or base64 data URL
const imageUrlSchema = z.string().refine(
  (val) => {
    if (!val || val.trim() === "") return true // Allow empty
    // Check if it's a valid URL
    try {
      new URL(val)
      return true
    } catch {
      // Check if it's a base64 data URL
      return val.startsWith('data:image/') && val.includes(';base64,')
    }
  },
  { message: "Must be a valid URL or base64 data URL" }
).nullable()

export const ProductCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  category: z.string().min(1),
  imageUrl: imageUrlSchema,
  stock: z.number().int().nonnegative(),
  isActive: z.boolean(),
  packSize: z.number().int().positive().optional() // 1, 6, 12, or 24
})

export const ProductUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  category: z.string().min(1).optional(),
  imageUrl: imageUrlSchema.optional(),
  stock: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  packSize: z.number().int().positive().optional()
})

export const OrderCreateSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive(), unitPrice: z.number().nonnegative() })),
  totalAmount: z.number().nonnegative()
})

export const SessionTokenSchema = z.string().min(1)