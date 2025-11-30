"use client"

import { useAuth } from "@clerk/nextjs"
import { serverComms } from "../../lib/servercomms"
import { Button } from "../ui/button"
import { formatPrice } from "../../lib/utils"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import Image from "next/image"
import { Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { toast } from "../../hooks/use-toast"

type ProductRowProps = {
  p: {
    id: string
    name: string
    description: string
    price: number
    imageUrl: string
    category: string
    stock: number
    isActive: boolean
    packSize?: number | null
  }
  onChange: () => void
}

export function AdminProductRow({ p, onChange }: ProductRowProps) {
  const { getToken } = useAuth()

  async function toggleActive() {
    const token = await getToken()
    if (!token) {
      toast({
        title: "Error",
        description: "Please sign in",
        variant: "destructive",
      })
      return
    }
    try {
      const res = await serverComms(`admin/products/${p.id}`, { 
        method: "PATCH", 
        data: { isActive: !p.isActive }, 
        headers: { Authorization: `Bearer ${token}` } 
      })
      if (res.error) {
        const isDatabaseError = res.error.includes("database") || 
                                res.error.includes("Can't reach") ||
                                res.error.includes("prisma") ||
                                res.error.includes("pooler.supabase") ||
                                res.error.includes("findUnique")
        const errorMsg = isDatabaseError
          ? "Database connection error. The backend cannot connect to the database. Please check your Supabase database connection settings in the backend."
          : res.error || "Failed to update product"
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Product ${!p.isActive ? "activated" : "deactivated"}`,
        })
        onChange()
      }
    } catch (error) {
      console.error("Failed to toggle active", error)
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      })
    }
  }

  async function deleteProduct() {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return
    const token = await getToken()
    if (!token) {
      toast({
        title: "Error",
        description: "Please sign in",
        variant: "destructive",
      })
      return
    }
    try {
      const res = await serverComms(`admin/products/${p.id}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
      })
      if (res.error) {
        const isDatabaseError = res.error.includes("database") || 
                                res.error.includes("Can't reach") ||
                                res.error.includes("prisma") ||
                                res.error.includes("pooler.supabase") ||
                                res.error.includes("findUnique")
        const errorMsg = isDatabaseError
          ? "Database connection error. The backend cannot connect to the database. Please check your Supabase database connection settings in the backend."
          : res.error || "Failed to delete product"
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
        onChange()
      }
    } catch (error) {
      console.error("Failed to delete product", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }
  
  const packLabel = p.packSize === 1 ? "Single" : p.packSize === 6 ? "6-Pack" : p.packSize === 12 ? "12-Pack" : p.packSize === 24 ? "24-Pack" : "Single"
  const descriptionPreview = p.description.length > 120 ? p.description.substring(0, 120) + "..." : p.description

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border">
      <CardContent className="p-0">
        <div className="flex gap-6 p-6">
          {/* Product Image */}
          <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
            {p.imageUrl ? (
              <Image
                src={p.imageUrl}
                alt={p.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                No Image
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">{p.name}</h3>
                    <Badge variant={p.isActive ? "default" : "secondary"} className="flex-shrink-0">
                      {p.isActive ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Draft
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {descriptionPreview}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-primary">{formatPrice(p.price)}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline" className="text-xs">
                  {p.category}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{packLabel}</span>
                <span className="text-muted-foreground">•</span>
                <span className={p.stock < 10 ? "text-destructive font-bold" : "text-muted-foreground"}>
                  Stock: {p.stock}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t">
              <Link href={`/dashboard/products/${p.id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                variant={p.isActive ? "outline" : "default"}
                size="sm"
                onClick={toggleActive}
              >
                {p.isActive ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteProduct}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}