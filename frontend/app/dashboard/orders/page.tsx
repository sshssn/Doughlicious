"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { serverComms } from "../../../lib/servercomms"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { formatPrice } from "../../../lib/utils"
import { formatCurrency } from "../../../lib/frontend-utils"
import { toast } from "../../../hooks/use-toast"
import { Loader2, Eye } from "lucide-react"
import { OrderReceipt } from "../../../components/admin/OrderReceipt"
import { NotificationBell } from "../../../components/shared/NotificationBell"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

type Order = {
  id: string
  orderNumber?: string | null
  email: string
  status: string
  totalAmount: number
  itemCount: number
  createdAt: string
}

type OrderDetail = {
  id: string
  orderNumber?: string | null
  status: string
  totalAmount: number
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

export default function OrdersAdminPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState<string | null>(null)
  const [previousOrdersCount, setPreviousOrdersCount] = useState(0)
  const [previousStatuses, setPreviousStatuses] = useState<Record<string, string>>({})
  const [orderChartData, setOrderChartData] = useState<Array<{ date: string; revenue: number; orders: number }>>([])
  const [statusData, setStatusData] = useState<Array<{ name: string; value: number; color: string }>>([])
  
  // Status color mapping using theme colors
  const STATUS_COLORS: Record<string, string> = {
    'Pending': '#fbbf24', // yellow-400
    'In Process': '#f59e0b', // yellow-500
    'Packed': '#3b82f6', // blue-500
    'Dispatched': '#8b5cf6', // purple-500
    'Completed': '#10b981', // green-500
    'Cancelled': '#ef4444', // red-500
    'Created': '#f97316', // orange-500
  }

  // Format status name properly
  const formatStatusName = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'in_process': 'In Process',
      'packed': 'Packed',
      'dispatched': 'Dispatched',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'created': 'Created',
    }
    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
  }

  useEffect(() => {
    async function fetchOrders() {
      if (!isSignedIn) return
      try {
        const token = await getToken()
        if (!token) return
        const res = await serverComms("admin/orders", { headers: { Authorization: `Bearer ${token}` } })
          if (res.data) {
            // Track previous statuses for notifications
            const statusMap: Record<string, string> = {}
            orders.forEach((o: Order) => {
              statusMap[o.id] = o.status
            })
            setPreviousStatuses(statusMap)
            setPreviousOrdersCount(orders.length)
            setOrders(res.data)
          
          // Process orders for charts (last 30 days)
          const now = new Date()
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          const filteredOrders = res.data.filter((o: Order) => new Date(o.createdAt) >= thirtyDaysAgo)
          
          // Group by date for line/bar chart
          const dailyData: Record<string, { revenue: number; orders: number; dateObj: Date }> = {}
          filteredOrders.forEach((order: Order) => {
            const orderDate = new Date(order.createdAt)
            const dateKey = orderDate.toISOString().split('T')[0]
            
            if (!dailyData[dateKey]) {
              dailyData[dateKey] = { revenue: 0, orders: 0, dateObj: orderDate }
            }
            dailyData[dateKey].revenue += order.totalAmount
            dailyData[dateKey].orders += 1
          })
          
          const chartData = Object.entries(dailyData)
            .map(([dateKey, data]) => {
              const dateLabel = data.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              return { 
                date: dateLabel, 
                revenue: data.revenue, 
                orders: data.orders,
                sortKey: dateKey
              }
            })
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
            .map(({ sortKey, ...rest }) => rest)
          
          setOrderChartData(chartData)
          
          // Process status distribution for pie chart
          const statusCounts: Record<string, number> = {}
          res.data.forEach((order: Order) => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
          })
          
          const statusChartData = Object.entries(statusCounts)
            .map(([status, value]) => ({
              name: formatStatusName(status),
              value,
              color: STATUS_COLORS[formatStatusName(status)] || 'hsl(var(--muted-foreground))'
            }))
            .sort((a, b) => b.value - a.value) // Sort by value descending
          
          setStatusData(statusChartData)
        }
      } catch (error) {
        console.error("Failed to fetch orders", error)
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (isLoaded) {
      fetchOrders()
      // Set up polling every 5 seconds for real-time updates
      const interval = setInterval(() => {
        fetchOrders()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isLoaded, isSignedIn, getToken])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const token = await getToken()
      if (!token) return
      const res = await serverComms(`admin/orders/${orderId}`, {
        method: "PATCH",
        data: { status: newStatus },
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data) {
        // Update local state immediately for better UX
        setOrders(orders.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)))
        toast({
          title: "Success",
          description: "Order status updated",
        })
        // Refresh orders list to get latest data from server
        const refreshRes = await serverComms("admin/orders", { headers: { Authorization: `Bearer ${token}` } })
        if (refreshRes.data) {
          setOrders(refreshRes.data)
        }
      }
    } catch (error) {
      console.error("Failed to update order", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleViewReceipt = async (orderId: string) => {
    setLoadingOrder(orderId)
    try {
      const token = await getToken()
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please sign in again.",
          variant: "destructive",
        })
        setLoadingOrder(null)
        return
      }
      const res = await serverComms(`admin/orders/${orderId}`, {
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
          <h1 className="text-3xl font-bold tracking-tight">Manage Orders</h1>
          <p className="text-muted-foreground">View and update order status</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">Live Updates</Badge>
          <NotificationBell 
            role="admin" 
            orders={orders}
            previousOrdersCount={previousOrdersCount}
            previousStatuses={previousStatuses}
          />
        </div>
      </div>

      {/* Order Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue from orders (Last 30 Days)</CardDescription>
          </CardHeader>
          <CardContent>
            {orderChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={orderChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `£${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <p className="text-sm">No revenue data available</p>
                  <p className="text-xs mt-1">Orders from the last 30 days will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Distribution of order statuses across all orders</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                    formatter={(value: number, name: string) => [`${value} orders`, name]}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string, entry: any) => (
                      <span style={{ color: 'hsl(var(--foreground))' }}>
                        {value} ({entry.payload.value})
                      </span>
                    )}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <p className="text-sm">No order data available</p>
                  <p className="text-xs mt-1">Order statuses will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Volume</CardTitle>
            <CardDescription>Daily number of orders (Last 30 Days)</CardDescription>
          </CardHeader>
          <CardContent>
            {orderChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="hsl(var(--primary))" 
                    name="Orders"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <p className="text-sm">No order data available</p>
                  <p className="text-xs mt-1">Orders from the last 30 days will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Statistics</CardTitle>
            <CardDescription>Key metrics and performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(orders.reduce((sum, o) => sum + o.totalAmount, 0))}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
                <p className="text-3xl font-bold">
                  {orders.length > 0 
                    ? formatCurrency(orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length)
                    : formatCurrency(0)
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-semibold">
                      {order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`}
                    </TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          order.status === "completed" ? "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20" :
                          order.status === "dispatched" ? "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20" :
                          order.status === "packed" ? "bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20" :
                          order.status === "in_process" ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20" :
                          order.status === "cancelled" ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20" :
                          "bg-muted text-muted-foreground"
                        }
                      >
                        {formatStatusName(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) => handleStatusUpdate(order.id, value)}
                        disabled={updating === order.id}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_process">Order in Process</SelectItem>
                          <SelectItem value="packed">Packed</SelectItem>
                          <SelectItem value="dispatched">Dispatched</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReceipt(order.id)}
                        disabled={loadingOrder === order.id}
                      >
                        {loadingOrder === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <OrderReceipt
        order={selectedOrder}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />
    </div>
  )
}