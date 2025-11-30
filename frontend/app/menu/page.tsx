"use client"
import { useEffect, useState, useMemo } from "react"
import { serverComms } from "../../lib/servercomms"
import { ProductCard } from "../../components/shared/ProductCard"
import { Product } from "../../types"
import { AlertCircle, Filter, X, SlidersHorizontal } from "lucide-react"
import { RetryButton } from "../../components/shared/RetryButton"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Label } from "../../components/ui/label"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Filter state
  const [search, setSearch] = useState(searchParams?.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "")
  const [minPrice, setMinPrice] = useState(searchParams?.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams?.get("maxPrice") || "")

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await serverComms("products/categories")
        if (res.data) {
          setCategories(res.data)
        }
      } catch (error) {
        console.error("Failed to fetch categories", error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch products with filters
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (selectedCategory) params.set("category", selectedCategory)
        if (minPrice) params.set("minPrice", minPrice)
        if (maxPrice) params.set("maxPrice", maxPrice)

        const queryString = params.toString()
        const res = await serverComms(`products${queryString ? `?${queryString}` : ""}`)

        if (res.error) {
          setError(res.error)
          setProducts([])
        } else {
          setProducts(res.data ?? [])
        }
      } catch (error: any) {
        setError(error.message || "Failed to load products")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [search, selectedCategory, minPrice, maxPrice])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (selectedCategory) params.set("category", selectedCategory)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)

    const newUrl = params.toString() ? `/menu?${params.toString()}` : "/menu"
    router.replace(newUrl, { scroll: false })
  }, [search, selectedCategory, minPrice, maxPrice, router])

  const clearFilters = () => {
    setSearch("")
    setSelectedCategory("")
    setMinPrice("")
    setMaxPrice("")
  }

  const hasActiveFilters = search || selectedCategory || minPrice || maxPrice

  // Calculate price range from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100 }
    const prices = products.map(p => p.price)
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }, [products])

  return (
    <main className="container mx-auto max-w-screen-2xl px-4 py-10 min-h-screen">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="Doughlicious" className="h-24 w-24 object-contain" />
        </div>
        <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4">Our Menu</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore our delicious selection of artisan donuts, crafted fresh daily with premium ingredients
        </p>
      </div>

      {/* Filters Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                {[search, selectedCategory, minPrice, maxPrice].filter(Boolean).length}
              </span>
            )}
          </Button>

          {/* Active Filters Count */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Price */}
                <div className="space-y-2">
                  <Label htmlFor="minPrice">Min Price (£)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>

                {/* Max Price */}
                <div className="space-y-2">
                  <Label htmlFor="maxPrice">Max Price (£)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="100"
                    min="0"
                    step="0.01"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Price Range Hint */}
              {products.length > 0 && (
                <p className="text-xs text-muted-foreground mt-4">
                  Price range: £{priceRange.min.toFixed(2)} - £{priceRange.max.toFixed(2)}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Products List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="text-lg text-muted-foreground">Loading products...</div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">Unable to Load Products</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Please check:</p>
              <ul className="list-disc list-inside space-y-1 text-left max-w-xs mx-auto">
                <li>Backend server is running on port 4000</li>
                <li>Environment variables are configured</li>
                <li>Database connection is active</li>
              </ul>
            </div>
            <RetryButton />
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-muted/50 border border-border rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters to see more products."
                : "We're currently updating our menu. Please check back soon!"}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
