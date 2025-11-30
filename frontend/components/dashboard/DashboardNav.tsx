"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "../../lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  Settings,
  Home,
  Menu,
  LogOut,
} from "lucide-react"
import { Button } from "../ui/button"
import { useClerk } from "@clerk/nextjs"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Boxes,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
]

const customerNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Account",
    href: "/account",
    icon: Users,
  },
]

export function DashboardNav({ role = "customer" }: { role?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()
  const navItems = role === "admin" ? adminNavItems : customerNavItems
  const isSettingsActive = pathname === "/dashboard/settings"

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Failed to sign out", error)
    }
  }

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1 space-y-2">
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 border border-transparent hover:border-border"
          >
            <Home className="h-5 w-5" />
            <span>Back to Store</span>
          </Link>
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent hover:border-border/50"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
                <span className="font-semibold">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Settings and Sign Out at the bottom */}
      <div className="mt-auto pt-4 border-t border-border/50 space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
            isSettingsActive
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent hover:border-border/50"
          )}
        >
          <Settings className={cn("h-5 w-5", isSettingsActive && "text-primary-foreground")} />
          <span className="font-semibold">Settings</span>
        </Link>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start gap-4 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 border border-transparent hover:border-destructive/20"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-semibold">Sign Out</span>
        </Button>
      </div>
    </nav>
  )
}

