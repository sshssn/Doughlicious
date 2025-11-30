"use client"
import { useEffect, useState } from "react"
import { serverComms } from "../../../lib/servercomms"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { formatPrice } from "../../../lib/utils"
import { useCart } from "../../../hooks/useCart"
import { Product } from "../../../types"
import Image from "next/image"
import { ShoppingCart, ArrowLeft, Check, Minus, Plus, AlertCircle, RefreshCw, Sparkles, ShoppingBag, PlusCircle, Filter, X, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Label } from "../../../components/ui/label"
import { ProductCard } from "../../../components/shared/ProductCard"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Input } from "../../../components/ui/input"
import { useAuth } from "@clerk/nextjs"
import { FlavorSelectionModal } from "../../../components/shared/FlavorSelectionModal"
import { useRouter } from "next/navigation"

export default function ProductPage() {
  const params = useParams()
  const id = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [availableFlavors, setAvailableFlavors] = useState<Product[]>([])
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const { addItem } = useCart()
  const { getToken, isSignedIn } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [flavorModalOpen, setFlavorModalOpen] = useState(false)
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [filterSearch, setFilterSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterMinPrice, setFilterMinPrice] = useState("")
  const [filterMaxPrice, setFilterMaxPrice] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function checkAdmin() {
      if (!isSignedIn) {
        setIsAdmin(false)
        return
      }
      try {
        const token = await getToken()
        if (!token) {
          setIsAdmin(false)
          return
        }
        const me = await serverComms("auth/me", { headers: { Authorization: `Bearer ${token}` } })
        setIsAdmin(me?.data?.role === "admin")
      } catch (error) {
        setIsAdmin(false)
      }
    }
    checkAdmin()
  }, [isSignedIn, getToken])

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

  const handleFilterApply = () => {
    const params = new URLSearchParams()
    if (filterSearch) params.set("search", filterSearch)
    if (filterCategory) params.set("category", filterCategory)
    if (filterMinPrice) params.set("minPrice", filterMinPrice)
    if (filterMaxPrice) params.set("maxPrice", filterMaxPrice)
    const queryString = params.toString()
    router.push(`/menu${queryString ? `?${queryString}` : ""}`)
  }

  const clearFilters = () => {
    setFilterSearch("")
    setFilterCategory("")
    setFilterMinPrice("")
    setFilterMaxPrice("")
  }

  const hasActiveFilters = filterSearch || filterCategory || filterMinPrice || filterMaxPrice

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await serverComms(`products/${id}`)

        if (res.error) {
          setProduct(null)
        } else if (res.data) {
          setProduct(res.data)
          
          // Fetch all products for flavors and frequently bought together
          const allProductsRes = await serverComms("products")
          if (allProductsRes.data) {
            const allProducts: Product[] = allProductsRes.data.filter((p: Product) => p.isActive && p.id !== id)
            
            // If it's a pack product, fetch available single donut flavors
            if (res.data.packSize && res.data.packSize > 1) {
              // Filter for single donuts (packSize = 1 or null) that are active
              const singleDonuts = allProducts.filter((p: Product) => 
                (p.packSize === 1 || !p.packSize)
              )
              setAvailableFlavors(singleDonuts)
              // Initialize selected flavors array
              setSelectedFlavors(new Array(res.data.packSize).fill(""))
            }
            
            // Set frequently bought together products
            // Show other pack sizes or complementary products (4-5 items)
            let relatedProducts: Product[] = []
            
            if (res.data.packSize === 1 || !res.data.packSize) {
              // If viewing a single donut, show pack products (6-pack, 12-pack)
              relatedProducts = allProducts.filter((p: Product) => 
                (p.packSize === 6 || p.packSize === 12) && p.category === res.data.category
              ).slice(0, 5)
            } else if (res.data.packSize === 6) {
              // If viewing 6-pack, show 12-pack and single donuts
              relatedProducts = allProducts.filter((p: Product) => 
                (p.packSize === 12 || p.packSize === 1 || !p.packSize) && p.category === res.data.category
              ).slice(0, 5)
            } else if (res.data.packSize === 12) {
              // If viewing 12-pack, show 6-pack and single donuts
              relatedProducts = allProducts.filter((p: Product) => 
                (p.packSize === 6 || p.packSize === 1 || !p.packSize) && p.category === res.data.category
              ).slice(0, 5)
            }
            
            // If not enough category matches, fill with any active products
            if (relatedProducts.length < 5) {
              const additional = allProducts
                .filter(p => !relatedProducts.some(rp => rp.id === p.id))
                .slice(0, 5 - relatedProducts.length)
              relatedProducts = [...relatedProducts, ...additional]
            }
            
            // Ensure we have 4-5 items
            setFrequentlyBoughtTogether(relatedProducts.slice(0, 5))
          }
        } else {
          setProduct(null)
        }
      } catch (e) {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleAddToCart = () => {
    if (isAdmin) {
      return // Admins cannot add to cart
    }
    if (product) {
      // Validate flavor selection for pack products
      if (product.packSize && product.packSize > 1) {
        const allFlavorsSelected = selectedFlavors.every(flavor => flavor !== "")
        if (!allFlavorsSelected) {
          alert(`Please select all ${product.packSize} flavors for your pack`)
          return
        }
      }
      
      for (let i = 0; i < quantity; i++) {
        const itemToAdd = {
          ...product,
          selectedFlavors: product.packSize && product.packSize > 1 ? [...selectedFlavors] : undefined
        }
        addItem(itemToAdd)
      }
    }
  }

  const handleFlavorChange = (index: number, flavorId: string) => {
    const newFlavors = [...selectedFlavors]
    newFlavors[index] = flavorId
    setSelectedFlavors(newFlavors)
  }

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, product?.stock || 99))
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1))

  const handleQuickAdd = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // If it's a pack product, show the flavor selection modal
    if (product.packSize && product.packSize > 1) {
      setSelectedProductForModal(product)
      setFlavorModalOpen(true)
    } else {
      // Regular product, add directly
      addItem(product)
    }
  }

  const handleAddToCartWithFlavors = (product: Product, selectedFlavors: string[]) => {
    const itemToAdd = {
      ...product,
      selectedFlavors: selectedFlavors,
    }
    addItem(itemToAdd)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-lg text-muted-foreground">Loading product details...</div>
        </div>
      </div>
    )
  }

  if (!product && !loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10">
        <div className="text-center space-y-4 px-4 max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="text-muted-foreground">
            The product you're looking for doesn't exist or couldn't be loaded. 
            It may have been removed or the connection to the server failed.
          </p>
          <div className="pt-4 space-y-2">
            <Link href="/menu">
              <Button variant="outline" className="gap-2 w-full">
                <ArrowLeft className="h-4 w-4" />
                Back to Menu
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="gap-2 w-full"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // Type guard - if we reach here, product must exist
  if (!product) {
    return null
  }

  // 1 pound = 1 Dough point
  const loyaltyPoints = Math.floor(product.price)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto max-w-7xl px-4 pt-28 pb-8">
        {/* Back Button and Filter Toggle */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <Link href="/menu">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                {[filterSearch, filterCategory, filterMinPrice, filterMaxPrice].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Products
                </CardTitle>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="h-7"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="filter-search" className="text-xs">Search</Label>
                  <Input
                    id="filter-search"
                    placeholder="Search..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="filter-category" className="text-xs">Category</Label>
                  <Select value={filterCategory || "all"} onValueChange={(value) => setFilterCategory(value === "all" ? "" : value)}>
                    <SelectTrigger id="filter-category" className="h-9 text-sm">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="filter-min-price" className="text-xs">Min Price (£)</Label>
                  <Input
                    id="filter-min-price"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    value={filterMinPrice}
                    onChange={(e) => setFilterMinPrice(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="filter-max-price" className="text-xs">Max Price (£)</Label>
                  <Input
                    id="filter-max-price"
                    type="number"
                    placeholder="100"
                    min="0"
                    step="0.01"
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleFilterApply} size="sm" className="gap-2">
                  Apply Filters
                  <ArrowLeft className="h-3 w-3 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Product Image - Sticky */}
          <div className="relative lg:sticky lg:top-8 lg:self-start">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-muted">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No Image Available
                </div>
              )}
              {/* Featured Badge */}
              <div className="absolute top-6 left-6">
                <Badge className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold shadow-lg">
                  Featured
                </Badge>
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col space-y-6">
            {/* Category Badge */}
            <div>
              <Badge
                variant="secondary"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1 text-xs font-medium mb-4"
              >
                {product.category}
              </Badge>
            </div>

            {/* Product Name */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg text-muted-foreground">per donut</span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Details Card */}
            <div className="bg-secondary/50 rounded-2xl p-5 space-y-3 border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Product Details</h3>
                <img src="/logo.svg" alt="Doughlicious" className="h-8 w-8 object-contain opacity-60" />
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Made fresh daily</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Premium ingredients</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Best enjoyed within 24 hours</span>
                </div>
              </div>
            </div>

            {/* Flavor Selection for Pack Products */}
            {product.packSize && product.packSize > 1 && availableFlavors.length > 0 && (
              <div className="space-y-4 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    Select Your {product.packSize} Flavors
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: product.packSize }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                          {index + 1}
                        </span>
                        Donut {index + 1}
                      </Label>
                      <Select
                        value={selectedFlavors[index] || ""}
                        onValueChange={(value) => handleFlavorChange(index, value)}
                      >
                        <SelectTrigger className="h-10 w-full border-2 hover:border-primary/50 focus:border-primary transition-colors bg-background">
                          <SelectValue placeholder="Choose a flavor..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFlavors.map((flavor) => (
                            <SelectItem key={flavor.id} value={flavor.id} className="cursor-pointer">
                              {flavor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-primary/10">
                  <p className="text-xs text-muted-foreground">
                    {selectedFlavors.filter(f => f !== "").length} of {product.packSize} flavors selected
                  </p>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-9 w-9 rounded-lg border-2 hover:border-primary/50 hover:bg-secondary/50 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-14 text-center">
                  <span className="text-xl font-semibold text-gray-900">{quantity}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= (product.stock || 0)}
                  className="h-9 w-9 rounded-lg border-2 hover:border-primary/50 hover:bg-secondary/50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            {isAdmin ? (
              <Button
                disabled
                className="w-full h-11 bg-muted text-muted-foreground font-semibold rounded-lg cursor-not-allowed gap-2 text-sm px-6"
              >
                <ShoppingCart className="h-4 w-4" />
                Admin View Only
              </Button>
            ) : (
              <Button
                onClick={handleAddToCart}
                className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:shadow-lg transition-all gap-2 text-sm px-6"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart · {formatPrice(product.price * quantity)}
              </Button>
            )}

            {/* Loyalty Points Message */}
            <p className="text-center text-sm text-gray-600">
              Earn <span className="font-semibold text-primary">{loyaltyPoints * quantity}</span> loyalty points with this purchase!
            </p>
          </div>
        </div>

        {/* Frequently Bought Together Section */}
        {frequentlyBoughtTogether.length > 0 && (
          <div className="mt-20 pt-20 border-t border-border/50">
            <div className="relative">
              {/* Header with Icon */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-center">Frequently Bought Together</h2>
                <div className="p-2 rounded-full bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-center text-muted-foreground text-lg mb-8">
                Complete your order with these popular choices
              </p>

              {/* Bundle Info Card */}
              <div className="max-w-2xl mx-auto mb-10">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/20">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Bundle & Save</p>
                        <p className="text-sm text-muted-foreground">
                          Add all items to cart for the best value
                        </p>
                      </div>
                    </div>
                    {isAdmin ? (
                      <Button
                        disabled
                        className="h-10 bg-muted text-muted-foreground font-semibold cursor-not-allowed gap-2 rounded-lg px-6 text-sm"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Admin View Only
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          frequentlyBoughtTogether.forEach((p) => addItem(p))
                        }}
                        className="h-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all gap-2 rounded-lg px-6 text-sm"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add All to Cart
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Products Grid - Horizontal Scroll on Mobile */}
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                  {frequentlyBoughtTogether.map((relatedProduct, index) => (
                    <div key={relatedProduct.id} className="relative group">
                      {/* Plus Icon Between Items (Desktop) */}
                      {index < frequentlyBoughtTogether.length - 1 && (
                        <div className="hidden lg:block absolute -right-4 xl:-right-6 top-1/2 -translate-y-1/2 z-10">
                          <div className="p-2 rounded-full bg-background border-2 border-primary/30 shadow-md">
                            <Plus className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      )}
                      
                      {/* Enhanced Product Card */}
                      <Link href={`/product/${relatedProduct.id}`}>
                        <Card className="overflow-hidden h-full flex flex-col group/card hover:shadow-2xl transition-all duration-300 border-2 border-border/50 hover:border-primary/50 cursor-pointer bg-card/50 backdrop-blur-sm">
                          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                            {relatedProduct.imageUrl ? (
                              <Image
                                src={relatedProduct.imageUrl}
                                alt={relatedProduct.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-muted-foreground">
                                No Image
                              </div>
                            )}
                            {/* Quick Add Overlay */}
                            {!isAdmin && (
                              <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/card:opacity-100">
                                <Button
                                  onClick={(e) => handleQuickAdd(relatedProduct, e)}
                                  className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-lg px-4 text-xs font-semibold gap-1.5"
                                >
                                  <ShoppingCart className="h-3.5 w-3.5" />
                                  Quick Add
                                </Button>
                              </div>
                            )}
                          </div>
                          <CardHeader className="p-5 pb-3">
                            <div className="space-y-2">
                              <CardTitle className="text-lg font-heading leading-tight group-hover/card:text-primary transition-colors line-clamp-2">
                                {relatedProduct.name}
                              </CardTitle>
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-primary">
                                  {formatPrice(relatedProduct.price)}
                                </span>
                                {relatedProduct.packSize && relatedProduct.packSize > 1 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {relatedProduct.packSize}-pack
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-5 pt-0 flex-1">
                            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                              {relatedProduct.description}
                            </p>
                          </CardContent>
                          <CardFooter className="p-5 pt-0">
                            {isAdmin ? (
                              <Button
                                disabled
                                className="w-full h-9 gap-1.5 bg-muted text-muted-foreground font-semibold rounded-lg text-xs cursor-not-allowed"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Admin View Only
                              </Button>
                            ) : (
                              <Button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleQuickAdd(relatedProduct, e)
                                }}
                                className="w-full h-9 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-xs shadow-sm hover:shadow transition-all"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Add to Cart
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-10 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  💡 Tip: Mix and match to create your perfect donut collection!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Flavor Selection Modal */}
        <FlavorSelectionModal
          product={selectedProductForModal}
          open={flavorModalOpen}
          onOpenChange={setFlavorModalOpen}
          onAddToCart={handleAddToCartWithFlavors}
        />
      </div>
    </main>
  )
}