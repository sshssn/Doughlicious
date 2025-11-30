"use client"
import { useUser, useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { serverComms } from "../../lib/servercomms"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { formatPrice } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import Link from "next/link"
import { Eye, Loader2 } from "lucide-react"
import { OrderReceipt } from "../../components/admin/OrderReceipt"
import { NotificationBell } from "../../components/shared/NotificationBell"
import { useToast } from "../../hooks/use-toast"

type OrderDetail = {
  id: string
  orderNumber?: string | null
  status: string
  totalAmount: number
  pointsRedeemed?: number
  stripeId?: string | null
  createdAt: string
  user?: {
    firstName?: string | null
    lastName?: string | null
    email: string
  } | null
  items: Array<{
    id: string
    product: {
      id: string
      name: string
      imageUrl?: string | null
    }
    quantity: number
    unitPrice: number
  }>
}

export default function AccountPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0)
  const [loadingPoints, setLoadingPoints] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState<string | null>(null)
  const [previousOrdersCount, setPreviousOrdersCount] = useState(0)
  const [previousStatuses, setPreviousStatuses] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchData() {
      if (isSignedIn) {
        try {
          const token = await getToken()
          if (!token) {
            setLoadingOrders(false)
            setLoadingPoints(false)
            return
          }
          
          // Fetch orders and loyalty points in parallel
          const [ordersRes, kpisRes] = await Promise.all([
            serverComms("my/orders", {
              headers: { Authorization: `Bearer ${token}` }
            }),
            serverComms("my/kpis", {
              headers: { Authorization: `Bearer ${token}` }
            })
          ])
          
          if (ordersRes.data) {
            // Track previous statuses for notifications
            const statusMap: Record<string, string> = {}
            orders.forEach((o: any) => {
              statusMap[o.id] = o.status
            })
            setPreviousStatuses(statusMap)
            setPreviousOrdersCount(orders.length)
            setOrders(ordersRes.data)
          }
          
          if (kpisRes.data) {
            const points = kpisRes.data.loyaltyPoints ?? 0
            setLoyaltyPoints(Number(points) || 0)
          }
        } catch (error) {
          console.error("Failed to fetch data", error)
        } finally {
          setLoadingOrders(false)
          setLoadingPoints(false)
        }
      }
    }
    fetchData()

    // Set up polling every 5 seconds for real-time order status updates
    const interval = setInterval(() => {
      if (isSignedIn) {
        fetchData()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isSignedIn, getToken])

  const handleViewReceipt = async (orderId: string) => {
    setLoadingOrder(orderId)
    try {
      const token = await getToken()
      if (!token) {
        console.error("No authentication token")
        toast({
          title: "Error",
          description: "Authentication required. Please sign in again.",
          variant: "destructive",
        })
        setLoadingOrder(null)
        return
      }
      const res = await serverComms(`my/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.error) {
        console.error("Failed to load order details:", res.error)
        toast({
          title: "Error",
          description: res.error || "Failed to load order details",
          variant: "destructive",
        })
      } else if (res.data) {
        setSelectedOrder(res.data)
        setReceiptOpen(true)
      } else {
        console.error("No data returned from order details")
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Failed to fetch order details", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load order details",
        variant: "destructive",
      })
    } finally {
      setLoadingOrder(null)
    }
  }

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!isSignedIn) {
    return (
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
        <p className="mb-8 text-muted-foreground">You need to be signed in to view your account.</p>
        <Link href="/auth">
          <Button>Sign In</Button>
        </Link>
      </main>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold">My Account</h1>
        <div className="flex items-center gap-4">
          <div className="text-muted-foreground">Welcome back, <span className="text-foreground font-medium">{user.firstName}</span></div>
          <NotificationBell 
            role="customer" 
            orders={orders}
            previousOrdersCount={previousOrdersCount}
            previousStatuses={previousStatuses}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Loyalty Card */}
        <Card className="md:col-span-1 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Loyalty Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-primary mb-2">
              {loadingPoints ? (
                <span className="text-2xl animate-pulse">Loading...</span>
              ) : (
                loyaltyPoints
              )}
            </div>
            <p className="text-sm text-muted-foreground">Earn 1 Dough for every £1 spent!</p>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile Details</CardTitle>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-muted-foreground">Name</div>
              <div className="col-span-2 font-semibold">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.firstName || user.username || "Not set"}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div className="col-span-2">{user.primaryEmailAddress?.emailAddress || "Not set"}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-muted-foreground">Member Since</div>
              <div className="col-span-2">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">You haven't placed any orders yet.</p>
                <Link href="/menu">
                  <Button variant="outline">Browse Menu</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-muted/50 p-3 rounded-lg transition-colors">
                    <div className="flex-1">
                      <div className="font-mono font-bold text-lg mb-1">
                        {order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</div>
                      {order.pointsRedeemed && order.pointsRedeemed > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          {order.pointsRedeemed} Dough points redeemed
                        </div>
                      )}
                      {order.status === 'completed' && (
                        <div className="text-xs text-primary mt-1">
                          Earned {Math.floor(order.totalAmount)} Dough points
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-lg mb-2">{formatPrice(order.totalAmount)}</div>
                        <div className={`text-xs px-3 py-1 rounded-full inline-block capitalize font-medium ${
                          order.status === 'completed' ? 'bg-green-500 text-white' :
                          order.status === 'dispatched' ? 'bg-blue-500 text-white' :
                          order.status === 'packed' ? 'bg-purple-500 text-white' :
                          order.status === 'in_process' ? 'bg-yellow-500 text-white' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {order.status === "in_process" ? "Order in Process" :
                           order.status === "completed" ? "Completed" :
                           order.status === "packed" ? "Packed" :
                           order.status === "dispatched" ? "Dispatched" :
                           order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " ")}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReceipt(order.id)}
                        disabled={loadingOrder === order.id}
                        className="flex-shrink-0"
                      >
                        {loadingOrder === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <OrderReceipt
        order={selectedOrder}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />
    </div>
  )
}