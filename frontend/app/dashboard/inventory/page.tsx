"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { serverComms } from "../../../lib/servercomms"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { formatPrice } from "../../../lib/utils"
import { toast } from "../../../hooks/use-toast"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"

type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  isActive: boolean
}

export default function InventoryPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      if (!isSignedIn) return
      try {
        const token = await getToken()
        if (!token) return
        const res = await serverComms("admin/products", { headers: { Authorization: `Bearer ${token}` } })
        if (res.data) {
          setProducts(res.data)
        }
      } catch (error) {
        console.error("Failed to fetch products", error)
        toast({
          title: "Error",
          description: "Failed to fetch inventory",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (isLoaded) {
      fetchProducts()
      // Set up polling every 5 seconds for real-time updates
      const interval = setInterval(() => {
        fetchProducts()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isLoaded, isSignedIn, getToken])

  const handleStockUpdate = async (productId: string, newStock: number) => {
    if (newStock < 0) return
    setUpdating(productId)
    try {
      const token = await getToken()
      if (!token) return
      const res = await serverComms(`admin/products/${productId}`, {
        method: "PATCH",
        data: { stock: newStock },
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data) {
        // Update local state immediately for better UX
        setProducts(products.map(p => (p.id === productId ? { ...p, stock: newStock } : p)))
        toast({
          title: "Success",
          description: "Stock updated",
        })
        // Refresh products list to get latest data from server
        const refreshRes = await serverComms("admin/products", { headers: { Authorization: `Bearer ${token}` } })
        if (refreshRes.data) {
          setProducts(refreshRes.data)
        }
      }
    } catch (error) {
      console.error("Failed to update stock", error)
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor and update stock levels</p>
        </div>
        <Badge variant="outline" className="text-xs">Live Updates</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "outline" : "secondary"}>
                        {product.isActive ? "Active" : "Archived"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.stock < 10 && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <span className={product.stock < 10 ? "text-amber-600 font-bold" : ""}>
                          {product.stock}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-20 h-8"
                          defaultValue={product.stock}
                          min={0}
                          disabled={updating === product.id}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value)
                            if (!isNaN(val) && val !== product.stock) {
                              handleStockUpdate(product.id, val)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = parseInt(e.currentTarget.value)
                              if (!isNaN(val) && val !== product.stock) {
                                handleStockUpdate(product.id, val)
                              }
                            }
                          }}
                        />
                        {updating === product.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}