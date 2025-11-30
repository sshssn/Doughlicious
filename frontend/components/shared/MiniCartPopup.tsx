"use client"

import { useEffect, useState } from "react"
import { X, ShoppingCart, Check } from "lucide-react"
import { Button } from "../ui/button"
import { formatPrice } from "../../lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "../../hooks/useCart"

type MiniCartPopupProps = {
  show: boolean
  product: {
    id: string
    name: string
    imageUrl?: string | null
    price: number
  } | null
  onClose: () => void
}

export function MiniCartPopup({ show, product, onClose }: MiniCartPopupProps) {
  const { items, total } = useCart()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation
      }, 4000)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, onClose])

  if (!show || !product) return null

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div
      className={`fixed bottom-4 right-4 z-[110] transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 animate-in slide-in-from-bottom-4 fade-in zoom-in-95"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-card border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden max-w-sm w-[360px] backdrop-blur-sm">
        {/* Header with close button */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 flex items-center justify-between border-b border-primary/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/20">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-sm text-primary">Added to Cart! 🍩</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-primary/20"
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex gap-3 items-center">
            {product.imageUrl && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/10">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{product.name}</p>
              <p className="text-primary font-bold text-sm mt-1">{formatPrice(product.price)}</p>
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-2">
            <span className="text-muted-foreground">Cart Total ({itemCount} {itemCount === 1 ? 'item' : 'items'}):</span>
            <span className="font-bold text-primary">{formatPrice(total)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
            >
              Continue Shopping
            </Button>
            <Link href="/cart" className="flex-1" onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}>
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Cart
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="h-1 bg-gradient-to-r from-primary via-primary/50 to-primary" />
      </div>
    </div>
  )
}

