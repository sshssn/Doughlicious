"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { serverComms } from "../../../lib/servercomms"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import { AdminProductRow } from "../../../components/admin/AdminProductRow"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

type Product = {
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

export default function ProductsAdminPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuthAndFetch() {
      if (!isLoaded) return
      if (!isSignedIn) {
        router.push("/")
        return
      }
      try {
        const token = await getToken()
        if (!token) {
          router.push("/")
          return
        }
        const me = await serverComms("auth/me", { headers: { Authorization: `Bearer ${token}` } })
        if (me?.data?.role !== "admin") {
          router.push("/")
          return
        }
        await fetchProducts(token)
      } catch (error) {
        console.error("Failed to check auth", error)
      }
    }
    checkAuthAndFetch()
  }, [isLoaded, isSignedIn, getToken, router])

  async function fetchProducts(token: string) {
    try {
      const res = await serverComms("admin/products", { headers: { Authorization: `Bearer ${token}` } })
      if (res.data) {
        setProducts(res.data)
      }
    } catch (error) {
      console.error("Failed to fetch products", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function setupPolling() {
      if (!isSignedIn || !isLoaded) return
      const token = await getToken()
      if (!token) return
      
      // Set up polling every 5 seconds for real-time updates
      const interval = setInterval(async () => {
        const currentToken = await getToken()
        if (currentToken) {
          await fetchProducts(currentToken)
        }
      }, 5000)
      return () => clearInterval(interval)
    }
    if (!loading && isSignedIn) {
      setupPolling()
    }
  }, [isSignedIn, isLoaded, loading, getToken])

  const handleProductChange = async () => {
    const token = await getToken()
    if (token) {
      await fetchProducts(token)
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
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>New Product</Button>
        </Link>
      </div>
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No products found</p>
            <p className="text-sm">Create your first product to get started</p>
          </div>
        ) : (
          products.map(p => (
            <AdminProductRow key={p.id} p={p} onChange={handleProductChange} />
          ))
        )}
      </div>
    </div>
  )
}
