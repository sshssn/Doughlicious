"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { serverComms } from "../../lib/servercomms"
import { DashboardNav } from "../../components/dashboard/DashboardNav"
import { DashboardBreadcrumb } from "../../components/dashboard/DashboardBreadcrumb"
import { Loader2, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../../components/ui/sheet"
import { Button } from "../../components/ui/button"
import { NotificationProvider, useNotifications } from "../../hooks/useNotifications"
import { NotificationBell } from "../../components/shared/NotificationBell"

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function checkAuth() {
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
        if (me?.data?.role) {
          setRole(me.data.role)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Failed to check auth", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [isLoaded, isSignedIn, getToken, router])

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex pt-8 pb-6 items-center justify-center border-b border-border/50 px-6 bg-background/50 backdrop-blur-sm">
        <Link href="/" className="flex items-center justify-center group">
          <img 
            src="/logo.svg" 
            alt="Doughlicious" 
            className="h-24 w-24 md:h-28 md:w-28 object-contain transition-transform group-hover:scale-105" 
          />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <DashboardNav role={role || "customer"} />
      </div>
    </div>
  )

  return (
    <NotificationProvider role={role}>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 flex-col border-r bg-gradient-to-b from-background to-muted/20 shadow-lg">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              <DashboardBreadcrumb />
            </div>
            {role === "admin" && (
              <div className="flex items-center gap-2">
                <NotificationBell role={role as "admin" | "customer"} orders={[]} />
              </div>
            )}
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>
}

