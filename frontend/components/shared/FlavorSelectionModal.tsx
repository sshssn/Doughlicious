"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Product } from "@/types"
import { serverComms } from "@/lib/servercomms"
import { formatPrice } from "@/lib/utils"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface FlavorSelectionModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToCart: (product: Product, selectedFlavors: string[]) => void
}

export function FlavorSelectionModal({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: FlavorSelectionModalProps) {
  const [availableFlavors, setAvailableFlavors] = useState<Product[]>([])
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchFlavors() {
      if (!product || !product.packSize || product.packSize <= 1) {
        return
      }

      setLoading(true)
      try {
        const allProductsRes = await serverComms("products")
        if (allProductsRes.data) {
          const allProducts: Product[] = allProductsRes.data.filter(
            (p: Product) => p.isActive && p.id !== product.id
          )
          // Filter for single donuts (packSize = 1 or null)
          const singleDonuts = allProducts.filter(
            (p: Product) => p.packSize === 1 || !p.packSize
          )
          setAvailableFlavors(singleDonuts)
          // Initialize selected flavors array
          setSelectedFlavors(new Array(product.packSize).fill(""))
        }
      } catch (error) {
        console.error("Failed to fetch flavors", error)
      } finally {
        setLoading(false)
      }
    }

    if (open && product) {
      fetchFlavors()
    }
  }, [open, product])

  // Prevent body scroll and layout shift when modal is open
  useEffect(() => {
    if (open) {
      // Store original overflow and padding
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight
      
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      
      // Prevent body scroll
      document.body.style.overflow = "hidden"
      // Add padding to compensate for scrollbar to prevent layout shift
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }

      return () => {
        // Restore original styles
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [open])

  const handleFlavorChange = (index: number, flavorId: string) => {
    const newFlavors = [...selectedFlavors]
    newFlavors[index] = flavorId
    setSelectedFlavors(newFlavors)
  }

  const handleAddToCart = () => {
    if (!product) return

    // Validate all flavors are selected
    const allFlavorsSelected = selectedFlavors.every((flavor) => flavor !== "")
    if (!allFlavorsSelected) {
      toast({
        title: "Selection Incomplete",
        description: `Please select all ${product.packSize} flavors for your pack`,
        variant: "destructive",
      })
      return
    }

    onAddToCart(product, selectedFlavors)
    onOpenChange(false)
    // Reset selections when modal closes
    setSelectedFlavors(new Array(product.packSize || 1).fill(""))
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            {product.imageUrl && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Select your {product.packSize} flavors
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">Loading flavors...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: product.packSize || 1 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </span>
                      Donut {index + 1}
                    </Label>
                    <Select
                      value={selectedFlavors[index] || ""}
                      onValueChange={(value) => handleFlavorChange(index, value)}
                    >
                      <SelectTrigger className="h-10 w-full border-2 hover:border-primary/50 focus:border-primary transition-colors">
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
              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {selectedFlavors.filter((f) => f !== "").length} of {product.packSize} flavors
                  selected
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={loading || selectedFlavors.some((f) => f === "")}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart · {formatPrice(product.price)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

