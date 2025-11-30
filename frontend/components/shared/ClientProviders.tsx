"use client"
import { ReactNode } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { CartProvider, useCart } from "../../hooks/useCart"
import { Toaster } from "../ui/toaster"
import { MiniCartPopup } from "./MiniCartPopup"
import { ScrollToTop } from "./ScrollToTop"

function CartPopupWrapper() {
  const { lastAddedProduct, showMiniCart, setShowMiniCart } = useCart()
  
  return (
    <MiniCartPopup
      show={showMiniCart}
      product={lastAddedProduct ? {
        id: lastAddedProduct.id,
        name: lastAddedProduct.name,
        imageUrl: lastAddedProduct.imageUrl,
        price: lastAddedProduct.price
      } : null}
      onClose={() => setShowMiniCart(false)}
    />
  )
}

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <CartProvider>
        <ScrollToTop />
        {children}
        <Toaster />
        <CartPopupWrapper />
      </CartProvider>
    </ClerkProvider>
  )
}