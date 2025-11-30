"use client"
import { useCart } from "../../hooks/useCart"
import { useState, useEffect, Suspense } from "react"
import { serverComms } from "../../lib/servercomms"
import { useAuth, useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { formatPrice } from "../../lib/utils"
import Image from "next/image"
import { Trash2, Plus, Minus, ShoppingCart, Sparkles, Clock, MapPin, Truck, Store } from "lucide-react"
import Link from "next/link"
import { Product } from "../../types"
import { ProductCard } from "../../components/shared/ProductCard"
import { Card, CardContent } from "../../components/ui/card"
import { FlavorSelectionModal } from "../../components/shared/FlavorSelectionModal"

function CartContent() {
  const { items, clearCart, updateQuantity, removeItem, total, addItem } = useCart()
  const { getToken, isSignedIn } = useAuth()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [orderStatus, setOrderStatus] = useState<string | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [flavorNames, setFlavorNames] = useState<Record<string, string>>({})
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [flavorModalOpen, setFlavorModalOpen] = useState(false)
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null)
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0)
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0)
  const [loadingPoints, setLoadingPoints] = useState(false)
  const params = useSearchParams()
  const success = params.get("success") === "true"
  const canceled = params.get("canceled") === "true"

  // Delivery & Pickup State
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery")
  const [pickupTime, setPickupTime] = useState<string>("")
  const [pickupLocation, setPickupLocation] = useState<string>("")

  // Generate pickup times (15 min increments up to 4 hours)
  const pickupTimeOptions = (() => {
    const options = []
    const now = new Date()
    // Round up to next 15 min slot
    const start = new Date(Math.ceil(now.getTime() / (15 * 60000)) * (15 * 60000))
    // Add 15 mins buffer for prep
    start.setMinutes(start.getMinutes() + 15)

    for (let i = 0; i <= 16; i++) { // 16 slots * 15 mins = 4 hours
      const time = new Date(start.getTime() + i * 15 * 60000)
      options.push({
        label: i === 0 ? "In 15 mins" :
          i === 1 ? "In 30 mins" :
            i === 3 ? "In 1 hour" :
              time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: time.toISOString()
      })
    }
    return options
  })()

  useEffect(() => {
    if (deliveryMethod === "pickup" && !pickupLocation) {
      const locations = ["Covent Garden", "Soho", "Shoreditch", "Notting Hill", "Camden Town", "South Kensington"]
      setPickupLocation(locations[Math.floor(Math.random() * locations.length)] + ", London")
      setPickupTime(pickupTimeOptions[0].value)
    }
  }, [deliveryMethod, pickupLocation])

  const deliveryFee = deliveryMethod === "delivery" && total < 9.99 ? 1.99 : 0
  const finalTotal = Math.max(0, total + deliveryFee - (pointsToRedeem / 10))

  // Fetch suggested products when cart is empty
  useEffect(() => {
    async function fetchSuggestedProducts() {
      if (items.length === 0 && !success) {
        setLoadingProducts(true)
        try {
          const res = await serverComms("products")
          if (res.data && Array.isArray(res.data)) {
            // Get active products, shuffle and take 8
            const activeProducts = res.data.filter((p: Product) => p.isActive)
            const shuffled = [...activeProducts].sort(() => Math.random() - 0.5)
            setSuggestedProducts(shuffled.slice(0, 8))
          }
        } catch (error) {
          console.error("Failed to fetch suggested products", error)
        } finally {
          setLoadingProducts(false)
        }
      }
    }
    fetchSuggestedProducts()
  }, [items.length, success])

  // Fetch flavor names for pack products
  useEffect(() => {
    async function fetchFlavorNames() {
      const flavorIds = new Set<string>()
      items.forEach(item => {
        if (item.selectedFlavors) {
          item.selectedFlavors.forEach(id => flavorIds.add(id))
        }
      })

      if (flavorIds.size > 0) {
        try {
          const allProducts = await serverComms("products")
          if (allProducts.data) {
            const names: Record<string, string> = {}
            allProducts.data.forEach((p: any) => {
              if (flavorIds.has(p.id)) {
                names[p.id] = p.name
              }
            })
            setFlavorNames(names)
          }
        } catch (error) {
          console.error("Failed to fetch flavor names", error)
        }
      }
    }
    if (items.length > 0) {
      fetchFlavorNames()
    }
  }, [items])

  // Fetch loyalty points balance
  useEffect(() => {
    async function fetchLoyaltyPoints() {
      if (isSignedIn) {
        setLoadingPoints(true)
        try {
          const token = await getToken()
          if (token) {
            const res = await serverComms("my/kpis", {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data) {
              const points = res.data.loyaltyPoints ?? 0
              setLoyaltyPoints(Number(points) || 0)
            }
          }
        } catch (error) {
          console.error("Failed to fetch loyalty points", error)
        } finally {
          setLoadingPoints(false)
        }
      }
    }
    fetchLoyaltyPoints()
  }, [isSignedIn, getToken])

  // Calculate total loyalty points: 1 pound = 1 Dough
  const totalLoyaltyPoints = items.reduce((sum, item) => {
    return sum + (Math.floor(item.price) * item.quantity)
  }, 0)

  useEffect(() => {
    if (success && items.length) {
      clearCart()
      setPointsToRedeem(0)
    }
  }, [success, items.length, clearCart])

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

  // Fetch latest order when payment is successful and poll for status updates
  useEffect(() => {
    async function fetchLatestOrder() {
      if (success && isSignedIn) {
        setLoadingOrder(true)
        try {
          const token = await getToken()
          if (token) {
            const res = await serverComms("my/orders", {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data && res.data.length > 0) {
              // Get the most recent order
              const latestOrder = res.data[0]
              setOrderNumber(latestOrder.orderNumber || latestOrder.id.slice(0, 8).toUpperCase())
              setOrderStatus(latestOrder.status || "pending")
            }
          }
        } catch (error) {
          console.error("Failed to fetch order", error)
        } finally {
          setLoadingOrder(false)
        }
      }
    }
    fetchLatestOrder()

    // Poll for status updates every 5 seconds
    if (success && isSignedIn) {
      const interval = setInterval(() => {
        fetchLatestOrder()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [success, isSignedIn, getToken])

  async function checkout() {
    // Require authentication - no guest checkout allowed
    if (!isSignedIn || !user) {
      window.location.href = "/auth?redirect=/cart"
      return
    }
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        console.error("No authentication token available")
        window.location.href = "/auth"
        return
      }

      // Transform cart items to the format expected by the backend
      const orderItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))

      const orderRes = await serverComms("orders", {
        method: "POST",
        data: {
          items: orderItems,
          pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : undefined,
          deliveryMethod,
          pickupTime: deliveryMethod === "pickup" ? pickupTime : undefined,
          pickupLocation: deliveryMethod === "pickup" ? pickupLocation : undefined
        },
        headers: { Authorization: `Bearer ${token}` }
      })

      if (orderRes.error) {
        console.error("Failed to create order:", orderRes.error)
        alert(`Failed to create order: ${orderRes.error}`)
        return
      }

      const orderId = orderRes?.data?.id
      if (orderId) {
        const checkoutRes = await serverComms("checkout", {
          method: "POST",
          data: { orderId },
          headers: { Authorization: `Bearer ${token}` }
        })

        if (checkoutRes.error) {
          console.error("Failed to create checkout session:", checkoutRes.error)
          alert(`Failed to create checkout session: ${checkoutRes.error}`)
          return
        }

        const url = checkoutRes?.data?.url
        if (url) {
          window.location.href = url
        } else {
          console.error("No checkout URL returned")
          alert("Failed to get checkout URL")
        }
      } else {
        console.error("No order ID returned")
        alert("Failed to create order")
      }
    } catch (error) {
      console.error("Checkout failed", error)
      alert("An error occurred during checkout. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !success) {
    return (
      <div className="space-y-12">
        {/* Empty Cart Message */}
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted/50 mb-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Looks like you haven't added any treats yet. Check out these delicious options below!
          </p>
        </div>

        {/* Suggested Products */}
        {loadingProducts ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">Loading delicious treats...</p>
          </div>
        ) : suggestedProducts.length > 0 ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold">You Might Like</h3>
                <div className="p-2 rounded-full bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground">Quick add these popular treats to your cart</p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {suggestedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden h-full flex flex-col group hover:shadow-xl transition-all duration-300 border-border/50">
                  <Link href={`/product/${product.id}`} className="flex-1 flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
                      )}
                      {/* Quick Add Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          onClick={(e) => handleQuickAdd(product, e)}
                          className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-lg px-6 text-sm font-semibold gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Quick Add
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                        <span className="font-bold text-xl text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.packSize && product.packSize > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            {product.packSize}-pack
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Link>
                  <div className="p-4 pt-0">
                    <Button
                      onClick={() => handleQuickAdd(product)}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:shadow transition-all gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center pt-6">
              <Link href="/menu">
                <Button size="lg" variant="outline" className="rounded-xl px-8">
                  View Full Menu
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">No products available at the moment.</p>
            <Link href="/menu">
              <Button size="lg">Browse Menu</Button>
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {success && (
        <div className="mb-8 border-2 border-green-500/30 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 p-10 rounded-3xl text-center shadow-2xl backdrop-blur-sm">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-4 shadow-lg animate-in fade-in zoom-in duration-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Main Message */}
          <h3 className="text-3xl font-heading font-bold text-green-800 mb-3">🎉 Payment Successful!</h3>
          <p className="text-green-700 mb-6 text-lg max-w-2xl mx-auto">
            Thank you for your order! We're preparing your delicious donuts right away and will notify you when they're ready.
          </p>

          {/* Order Number & Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-green-200 shadow-inner max-w-md mx-auto">
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Order Number</p>
            {loadingOrder ? (
              <div className="text-lg font-mono text-green-800 animate-pulse">Loading...</div>
            ) : orderNumber ? (
              <div className="text-2xl font-mono font-bold text-green-800 tracking-wider mb-4">{orderNumber}</div>
            ) : (
              <div className="text-lg font-mono text-green-800 mb-4">Processing...</div>
            )}

            {/* Order Status Badge */}
            {orderStatus && (
              <div className="mt-4 pt-4 border-t border-green-200/50">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Order Status</p>
                <div className="flex items-center justify-center">
                  <Badge
                    variant={
                      orderStatus === "completed" ? "default" :
                        orderStatus === "dispatched" ? "default" :
                          orderStatus === "packed" ? "secondary" :
                            "secondary"
                    }
                    className={`text-sm px-4 py-1.5 font-semibold ${orderStatus === "completed" ? "bg-green-500 hover:bg-green-600 text-white" :
                      orderStatus === "dispatched" ? "bg-blue-500 hover:bg-blue-600 text-white" :
                        orderStatus === "packed" ? "bg-purple-500 hover:bg-purple-600 text-white" :
                          orderStatus === "in_process" ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
                            orderStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }`}
                  >
                    {orderStatus === "in_process" ? "Order in Process" :
                      orderStatus === "completed" ? "Completed" :
                        orderStatus === "packed" ? "Packed" :
                          orderStatus === "dispatched" ? "Dispatched" :
                            orderStatus === "pending" ? "Pending Payment" :
                              orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1).replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Status updates automatically when your order progresses
                </p>
              </div>
            )}
          </div>

          {/* Loyalty Points */}
          {totalLoyaltyPoints > 0 && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-5 mb-6 inline-block border border-primary/20">
              <p className="text-sm font-medium text-primary mb-1">You've earned</p>
              <p className="text-3xl font-bold text-primary">{totalLoyaltyPoints} Dough</p>
              <p className="text-xs text-muted-foreground mt-2">points added to your account</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/account">
              <Button variant="outline" size="lg" className="rounded-xl min-w-[160px] border-2">
                View Orders
              </Button>
            </Link>
            <Link href="/menu">
              <Button size="lg" className="rounded-xl min-w-[160px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      )}

      {canceled && (
        <div className="mb-8 border border-yellow-200 bg-yellow-50 p-4 rounded-lg text-yellow-800">
          Payment canceled. You can try again or continue shopping.
        </div>
      )}

      {!success && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((i, index) => (
              <div key={`${i.id}-${i.selectedFlavors ? i.selectedFlavors.join(',') : ''}-${index}`} className="bg-card rounded-xl border border-border/50 p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                    {i.imageUrl && <Image src={i.imageUrl} alt={i.name} fill className="object-cover" sizes="96px" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{i.name}</h3>
                      {i.selectedFlavors && i.selectedFlavors.length > 0 && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <p className="font-medium mb-1">Selected Flavors:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {i.selectedFlavors.map((flavorId, idx) => (
                              <li key={idx}>
                                {flavorNames[flavorId] || `Flavor ${idx + 1}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-primary font-bold text-lg">{formatPrice(i.price)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg"
                          onClick={() => updateQuantity(i.id, i.quantity - 1, i.selectedFlavors)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-semibold">{i.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg"
                          onClick={() => updateQuantity(i.id, i.quantity + 1, i.selectedFlavors)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg">{formatPrice(i.price * i.quantity)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => removeItem(i.id, i.selectedFlavors)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border/50 p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>

              {/* User Info Section */}
              {isSignedIn && user && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6 border border-border/50">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Checkout as:</p>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || user.username || "User"}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                  </div>
                  <Link href="/account" className="text-xs text-primary hover:underline mt-2 inline-block">
                    Update profile →
                  </Link>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {pointsToRedeem > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Points Redeemed ({pointsToRedeem} Dough)</span>
                    <span>-{formatPrice(pointsToRedeem / 10)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  {deliveryMethod === "pickup" ? (
                    <span className="text-green-600">Free (Pickup)</span>
                  ) : deliveryFee > 0 ? (
                    <span>{formatPrice(deliveryFee)}</span>
                  ) : (
                    <span className="text-green-600">Free</span>
                  )}
                </div>
                {deliveryMethod === "delivery" && deliveryFee > 0 && (
                  <p className="text-xs text-amber-600">
                    Add {formatPrice(9.99 - total)} more for free delivery!
                  </p>
                )}
                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Delivery Method Selection */}
              <div className="bg-muted/30 rounded-lg p-4 mb-6 border border-border/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  {deliveryMethod === "delivery" ? <Truck className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                  Delivery Method
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    variant={deliveryMethod === "delivery" ? "default" : "outline"}
                    onClick={() => setDeliveryMethod("delivery")}
                    className="w-full"
                  >
                    <Truck className="mr-2 h-4 w-4" /> Delivery
                  </Button>
                  <Button
                    variant={deliveryMethod === "pickup" ? "default" : "outline"}
                    onClick={() => setDeliveryMethod("pickup")}
                    className="w-full"
                  >
                    <Store className="mr-2 h-4 w-4" /> Pickup
                  </Button>
                </div>

                {deliveryMethod === "pickup" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Pickup Location</label>
                      <div className="flex items-center gap-2 text-sm font-medium p-2 bg-background rounded border border-border">
                        <MapPin className="h-4 w-4 text-primary" />
                        {pickupLocation}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Pickup Time</label>
                      <div className="relative">
                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <select
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full h-9 pl-8 pr-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {pickupTimeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dough Points Redemption */}
              {isSignedIn && (
                <div className="bg-secondary/50 rounded-lg p-4 mb-6 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Available Dough Points</p>
                      <p className="text-2xl font-bold text-primary">{loadingPoints ? "..." : loyaltyPoints}</p>
                    </div>
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  {loyaltyPoints > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={Math.min(loyaltyPoints, Math.floor(total * 10))}
                          value={pointsToRedeem}
                          onChange={(e) => {
                            const maxRedeemable = Math.min(loyaltyPoints, Math.floor(total * 10))
                            const value = Math.max(0, Math.min(Number(e.target.value), maxRedeemable))
                            setPointsToRedeem(value)
                          }}
                          className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-sm"
                          placeholder="Points to redeem"
                          disabled={total < 9.99}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const maxRedeemable = Math.min(loyaltyPoints, Math.floor(total * 10))
                            setPointsToRedeem(maxRedeemable)
                          }}
                          disabled={loyaltyPoints === 0 || total === 0 || total < 9.99}
                        >
                          Max
                        </Button>
                        {pointsToRedeem > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPointsToRedeem(0)}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        10 Dough = £1 discount. You can redeem up to {Math.min(loyaltyPoints, Math.floor(total * 10))} points.
                      </p>
                      {total < 9.99 && (
                        <p className="text-xs text-destructive mt-1">
                          Minimum order of £9.99 required to redeem points.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      You don't have any Dough Points yet. Earn 1 Dough per £1 spent on orders of £9.99 or more!
                    </p>
                  )}
                </div>
              )}

              {totalLoyaltyPoints > 0 && (
                <div className="bg-secondary/50 rounded-lg p-4 mb-6 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">You'll earn</p>
                  <p className="text-2xl font-bold text-primary">{totalLoyaltyPoints} Dough</p>
                  <p className="text-xs text-muted-foreground mt-1">loyalty points</p>
                </div>
              )}

              <div className="space-y-3">
                {!isSignedIn ? (
                  <Link href="/auth?redirect=/cart" className="block">
                    <Button size="lg" className="w-full">
                      Sign In to Checkout
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={checkout}
                    disabled={loading || items.length === 0}
                  >
                    {loading ? "Processing..." : "Proceed to Checkout"}
                  </Button>
                )}
                <Link href="/menu" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
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
    </>
  )
}

export default function CartPage() {
  return (
    <main className="container mx-auto max-w-7xl px-4 pt-28 pb-10 min-h-screen">
      <div className="mb-8">
        <h2 className="text-4xl font-heading font-bold mb-2">Shopping Cart</h2>
        <p className="text-muted-foreground">Review your items and proceed to checkout</p>
      </div>
      <Suspense fallback={<div>Loading cart...</div>}>
        <CartContent />
      </Suspense>
    </main>
  )
}