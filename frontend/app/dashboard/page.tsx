"use client"

import { useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { serverComms } from "../../lib/servercomms"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { formatCurrency } from "../../lib/frontend-utils"
import { Loader2 } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function DashboardHomePage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const [role, setRole] = useState<string | null>(null)
  const [adminKpis, setAdminKpis] = useState({ ordersCount: 0, revenue: 0, lowStockCount: 0, activeProducts: 0 })
  const [userKpis, setUserKpis] = useState({ ordersCount: 0, totalSpent: 0, loyaltyPoints: 0 })
  const [userOrders, setUserOrders] = useState<Array<{ id: string; status: string; totalAmount: number; itemCount: number; createdAt: string }>>([])
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState<Array<{ date: string; revenue: number; orders: number }>>([])
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      if (!isSignedIn || !isLoaded) return
      try {
        const token = await getToken()
        if (!token) return

        // Check user role
        const me = await serverComms("auth/me", { headers: { Authorization: `Bearer ${token}` } })
        const userRole = me?.data?.role as string
        setRole(userRole)

        if (userRole === "admin") {
          // Fetch admin KPIs and orders for charts
          const [k, ordersRes] = await Promise.all([
            serverComms("admin/kpis", { headers: { Authorization: `Bearer ${token}` } }),
            serverComms("admin/orders", { headers: { Authorization: `Bearer ${token}` } })
          ])
          if (k.data) {
            setAdminKpis(k.data)
          }
          if (ordersRes.data) {
            setOrders(ordersRes.data)
            // Process orders for chart data (last 30 days)
            const now = new Date()
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            const filteredOrders = ordersRes.data.filter((o: any) => new Date(o.createdAt) >= thirtyDaysAgo)

            // Group by date
            const dailyData: Record<string, { revenue: number; orders: number; dateObj: Date }> = {}
            filteredOrders.forEach((order: any) => {
              const orderDate = new Date(order.createdAt)
              const dateKey = orderDate.toISOString().split('T')[0] // YYYY-MM-DD format

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
              .map(({ sortKey, ...rest }) => rest) // Remove sortKey from final data

            setSalesData(chartData)
          }
        } else {
          // Fetch user KPIs and orders
          const [kpisRes, ordersRes] = await Promise.all([
            serverComms("my/kpis", { headers: { Authorization: `Bearer ${token}` } }),
            serverComms("my/orders", { headers: { Authorization: `Bearer ${token}` } })
          ])
          if (kpisRes.data) {
            setUserKpis(kpisRes.data)
          }
          if (ordersRes.data) {
            setUserOrders(ordersRes.data)
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }
    if (isSignedIn && isLoaded) {
      fetchData()

      // Set up polling every 5 seconds for real-time updates
      const interval = setInterval(() => {
        fetchData()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [isSignedIn, isLoaded, getToken])

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
        <div className="text-muted-foreground">Please sign in to access your dashboard.</div>
        <div className="mt-4"><Link href="/auth" className="underline">Go to sign in</Link></div>
      </div>
    )
  }

  if (role === "admin") {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">Overview of your business performance</p>
          </div>
          <Badge variant="outline" className="text-xs">Live Updates</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Total orders</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{adminKpis.ordersCount}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>All-time</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{formatCurrency(adminKpis.revenue)}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Products</CardTitle>
              <CardDescription>Visible in store</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{adminKpis.activeProducts}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Low Stock</CardTitle>
              <CardDescription>&lt; 10 remaining</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{adminKpis.lowStockCount}</CardContent>
          </Card>
        </div>

        {/* Sales Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
              <CardDescription>Daily revenue performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `£${value}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders Trend (Last 30 Days)</CardTitle>
              <CardDescription>Daily order volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Link href="/dashboard/products" className="border rounded-lg p-4 hover:bg-accent transition-colors">
            <div className="font-medium mb-1">Manage Products</div>
            <div className="text-muted-foreground text-sm">Create, edit, and archive</div>
          </Link>
          <Link href="/dashboard/orders" className="border rounded-lg p-4 hover:bg-accent transition-colors">
            <div className="font-medium mb-1">Manage Orders</div>
            <div className="text-muted-foreground text-sm">Track and fulfill</div>
          </Link>
          <Link href="/dashboard/inventory" className="border rounded-lg p-4 hover:bg-accent transition-colors">
            <div className="font-medium mb-1">Inventory</div>
            <div className="text-muted-foreground text-sm">Stock and alerts</div>
          </Link>
          <Link href="/dashboard/users" className="border rounded-lg p-4 hover:bg-accent transition-colors">
            <div className="font-medium mb-1">Users</div>
            <div className="text-muted-foreground text-sm">View customers</div>
          </Link>
        </div>
      </div>
    )
  }

  const recent = userOrders.slice(0, 5)
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Your orders and account overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Placed</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{userKpis.ordersCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
            <CardDescription>All-time</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{formatCurrency(userKpis.totalSpent)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Loyalty</CardTitle>
            <CardDescription>Points</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{userKpis.loyaltyPoints}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your 5 latest orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id.substring(0, 8)}</TableCell>
                  <TableCell><Badge>{o.status}</Badge></TableCell>
                  <TableCell>{o.itemCount}</TableCell>
                  <TableCell className="text-right">{formatCurrency(o.totalAmount)}</TableCell>
                </TableRow>
              ))}
              {recent.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">No orders yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}