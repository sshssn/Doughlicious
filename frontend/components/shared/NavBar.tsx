"use client"
import Link from "next/link"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useCart } from "../../hooks/useCart"
import { ShoppingBag, User, Home, UtensilsCrossed, LayoutDashboard, Search, X, Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { serverComms } from "../../lib/servercomms"
import { Product } from "../../types"
import { MiniProductCard } from "./MiniProductCard"
import { Loader2 } from "lucide-react"

export function NavBar() {
  const { items } = useCart()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  // Prevent hydration mismatch by only rendering cart count after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Search for products with debouncing
  useEffect(() => {
    const searchProducts = async () => {
      const query = searchQuery.trim()
      if (!query || query.length < 2) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const params = new URLSearchParams()
        params.set("search", query)
        const res = await serverComms(`products?${params.toString()}`)
        if (res.data) {
          setSearchResults(res.data.slice(0, 6)) // Limit to 6 results for mini view
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      searchProducts()
    }, 400) // Debounce search by 400ms

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by useEffect, this just prevents form submission
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full flex justify-center" style={{ margin: 0, padding: 0 }}>
      <div className="flex justify-center pt-2" style={{ margin: 0 }}>
        <nav className="flex h-14 items-center gap-2 px-3 rounded-xl bg-white/80 backdrop-blur-md border border-white/20 shadow-lg shadow-black/5">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-background/50 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link 
            href="/menu" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-background/50 transition-all"
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>Menu</span>
          </Link>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-background/50 transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium">
                <User className="h-4 w-4" />
                <span>Sign in</span>
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchModalOpen(true)}
            className="rounded-lg"
            aria-label="Search products"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative rounded-lg">
              <ShoppingBag className="h-5 w-5" />
              {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Button>
          </Link>
        </nav>

      </div>

      {/* Search Modal */}
      <Dialog open={isSearchModalOpen} onOpenChange={(open) => {
        setIsSearchModalOpen(open)
        if (!open) {
          setSearchQuery("")
          setSearchResults([])
        }
      }}>
        <DialogContent className="sm:max-w-md max-h-[60vh] flex flex-col p-4">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg">Search Products</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-10"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setSearchResults([])
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          </form>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isSearching ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-xs text-muted-foreground">Searching...</span>
              </div>
            ) : searchQuery.trim().length >= 2 && searchResults.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground">No products found</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((product) => (
                  <MiniProductCard 
                    key={product.id} 
                    product={product}
                    onProductClick={() => {
                      setIsSearchModalOpen(false)
                      setSearchQuery("")
                      setSearchResults([])
                    }}
                  />
                ))}
              </div>
            ) : searchQuery.trim().length > 0 && searchQuery.trim().length < 2 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground">Type at least 2 characters...</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground">Start typing to search...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}