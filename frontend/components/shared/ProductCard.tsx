"use client"
import { Product } from "@/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState, memo } from "react"
import { serverComms } from "@/lib/servercomms"
import { FlavorSelectionModal } from "./FlavorSelectionModal"

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
    const { addItem } = useCart()
    const { getToken, isSignedIn } = useAuth()
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
    const [flavorModalOpen, setFlavorModalOpen] = useState(false)

    useEffect(() => {
        async function checkAdmin() {
            if (!isSignedIn) {
                setIsAdmin(false)
                return
            }
            try {
                const token = await getToken()
                if (!token) {
                    setIsAdmin(false)
                    return
                }
                const me = await serverComms("auth/me", { headers: { Authorization: `Bearer ${token}` } })
                setIsAdmin(me?.data?.role === "admin")
            } catch (error) {
                setIsAdmin(false)
            }
        }
        checkAdmin()
    }, [isSignedIn, getToken])

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation when clicking Add to Cart
        if (isAdmin) {
            return // Admins cannot add to cart
        }
        
        // If it's a pack product, show the flavor selection modal
        if (product.packSize && product.packSize > 1) {
            setFlavorModalOpen(true)
        } else {
            // Regular product, add directly
            addItem(product)
        }
    }

    const handleAddToCartWithFlavors = (product: Product, selectedFlavors: string[]) => {
        const itemToAdd = {
            ...product,
            selectedFlavors: selectedFlavors,
        }
        addItem(itemToAdd)
    }

    return (
        <>
        <Link href={`/product/${product.id}`}>
            <Card className="overflow-hidden h-full flex flex-col group hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer">
                <div className="relative aspect-square overflow-hidden bg-muted">
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
                    )}
                </div>
                <CardHeader className="p-4">
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg font-heading leading-tight group-hover:text-primary transition-colors">{product.name}</CardTitle>
                        <span className="font-bold text-primary whitespace-nowrap">{formatPrice(product.price)}</span>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1">
                    <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    {isAdmin ? (
                        <Button 
                            disabled
                            className="w-full h-9 gap-1.5 text-xs font-semibold rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                        >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Admin View Only
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleAddToCart} 
                            className="w-full h-9 gap-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow transition-all"
                        >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Add to Cart
        </Button>
      )}
    </CardFooter>
  </Card>
</Link>
      <FlavorSelectionModal
        product={flavorModalOpen ? product : null}
        open={flavorModalOpen}
        onOpenChange={setFlavorModalOpen}
        onAddToCart={handleAddToCartWithFlavors}
      />
    </>
  )
})
