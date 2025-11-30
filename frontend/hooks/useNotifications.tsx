"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { serverComms } from "../lib/servercomms"

export type Notification = {
  id: string
  type: "new_order" | "status_update"
  message: string
  orderId?: string
  orderNumber?: string
  status?: string
  timestamp: Date
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children, role }: { children: ReactNode; role: string | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const previousOrdersCountRef = useRef(0)
  const previousStatusesRef = useRef<Record<string, string>>({})
  const { getToken, isSignedIn } = useAuth()

  const refreshNotifications = useCallback(async () => {
    if (!isSignedIn || !role) return

    try {
      const token = await getToken()
      if (!token) return

      const endpoint = role === "admin" ? "admin/orders" : "my/orders"
      const res = await serverComms(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      
      if (res.data && Array.isArray(res.data)) {
        const orders = res.data
        const newNotifications: Notification[] = []

        // Check for new orders (admin only)
        if (role === "admin" && orders.length > previousOrdersCountRef.current) {
          const newOrders = orders.slice(0, orders.length - previousOrdersCountRef.current)
          newOrders.forEach((order: any) => {
            newNotifications.push({
              id: `new-${order.id}-${Date.now()}`,
              type: "new_order",
              message: `New order received: ${order.orderNumber || order.id.slice(0, 8)}`,
              orderId: order.id,
              orderNumber: order.orderNumber,
              timestamp: new Date(order.createdAt),
              read: false
            })
          })
        }

        // Check for status updates (both admin and customer)
        orders.forEach((order: any) => {
          const previousStatus = previousStatusesRef.current[order.id]
          if (previousStatus && previousStatus !== order.status) {
            newNotifications.push({
              id: `status-${order.id}-${Date.now()}`,
              type: "status_update",
              message: `Order ${order.orderNumber || order.id.slice(0, 8)} status updated to ${order.status.replace(/_/g, " ")}`,
              orderId: order.id,
              orderNumber: order.orderNumber,
              status: order.status,
              timestamp: new Date(),
              read: false
            })
          }
        })

        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev].slice(0, 50)) // Keep last 50
        }

        // Update previous state refs
        previousOrdersCountRef.current = orders.length
        const newStatuses: Record<string, string> = {}
        orders.forEach((order: any) => {
          newStatuses[order.id] = order.status
        })
        previousStatusesRef.current = newStatuses
      }
    } catch (error) {
      console.error("Failed to refresh notifications", error)
    }
  }, [isSignedIn, role, getToken])

  // Poll for notifications every 3 seconds
  useEffect(() => {
    if (!isSignedIn || !role) {
      setNotifications([])
      previousOrdersCountRef.current = 0
      previousStatusesRef.current = {}
      return
    }

    refreshNotifications()
    const interval = setInterval(refreshNotifications, 3000)

    return () => clearInterval(interval)
  }, [isSignedIn, role, refreshNotifications])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

