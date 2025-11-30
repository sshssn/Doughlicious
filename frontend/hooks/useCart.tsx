"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Product, CartItem } from "../types"
import { useToast } from "./use-toast"
import { useAuth } from "@clerk/nextjs"
import { serverComms } from "../lib/servercomms"

interface CartContextType {
    items: CartItem[]
    addItem: (product: Product) => void
    removeItem: (id: string, selectedFlavors?: string[]) => void
    updateQuantity: (id: string, quantity: number, selectedFlavors?: string[]) => void
    clearCart: () => void
    total: number
    lastAddedProduct: (Product & { selectedFlavors?: string[] }) | null
    showMiniCart: boolean
    setShowMiniCart: (show: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [lastAddedProduct, setLastAddedProduct] = useState<(Product & { selectedFlavors?: string[] }) | null>(null)
    const [showMiniCart, setShowMiniCart] = useState(false)
    const { toast } = useToast()
    const { getToken, isSignedIn } = useAuth()
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("cart")
        if (saved) {
            try {
                setItems(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse cart", e)
            }
        }
    }, [])

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items))
    }, [items])

    // Check if user is admin
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

    const addItem = (product: Product & { selectedFlavors?: string[] }) => {
        // Prevent admins from adding items to cart
        if (isAdmin === true) {
            queueMicrotask(() => {
                toast({
                    title: "Admin Access",
                    description: "Admins cannot add items to cart. Please use the dashboard to manage products.",
                    variant: "destructive",
                })
            })
            return
        }

        setItems(prev => {
            // For pack products with flavors, create a unique key based on ID + flavors
            // For regular products, just use ID
            const itemKey = product.selectedFlavors
                ? `${product.id}-${product.selectedFlavors.join(',')}`
                : product.id

            const existing = prev.find(i => {
                if (i.selectedFlavors && product.selectedFlavors) {
                    return i.id === product.id &&
                        JSON.stringify(i.selectedFlavors.sort()) === JSON.stringify(product.selectedFlavors.sort())
                }
                return i.id === product.id && !i.selectedFlavors && !product.selectedFlavors
            })

            if (existing) {
                // Show mini cart popup for quantity increase too
                setLastAddedProduct(product)
                setShowMiniCart(true)
                // Defer toast call to avoid updating during render
                queueMicrotask(() => {
                    toast({
                        title: "Cart Updated",
                        description: `${product.name} quantity increased`,
                    })
                })
                return prev.map(i =>
                    (i.id === product.id &&
                        ((i.selectedFlavors && product.selectedFlavors &&
                            JSON.stringify(i.selectedFlavors.sort()) === JSON.stringify(product.selectedFlavors.sort())) ||
                            (!i.selectedFlavors && !product.selectedFlavors)))
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            }
            // Show mini cart popup
            setLastAddedProduct(product)
            setShowMiniCart(true)
            // Defer toast call to avoid updating during render
            queueMicrotask(() => {
                toast({
                    title: "Added to Cart! 🍩",
                    description: `${product.name} has been added to your cart`,
                })
            })
            return [...prev, { ...product, quantity: 1, selectedFlavors: product.selectedFlavors }]
        })
    }

    const removeItem = (id: string, selectedFlavors?: string[]) => {
        const item = items.find(i => {
            if (i.selectedFlavors && selectedFlavors) {
                return i.id === id &&
                    JSON.stringify(i.selectedFlavors.sort()) === JSON.stringify(selectedFlavors.sort())
            }
            return i.id === id && !i.selectedFlavors && !selectedFlavors
        })
        setItems(prev => prev.filter(i => {
            if (i.selectedFlavors && selectedFlavors) {
                return !(i.id === id &&
                    JSON.stringify(i.selectedFlavors.sort()) === JSON.stringify(selectedFlavors.sort()))
            }
            return !(i.id === id && !i.selectedFlavors && !selectedFlavors)
        }))
        if (item) {
            // Defer toast call to avoid updating during render
            queueMicrotask(() => {
                toast({
                    title: "Removed from Cart",
                    description: `${item.name} has been removed`,
                    variant: "destructive",
                })
            })
        }
    }

    const updateQuantity = (id: string, quantity: number, selectedFlavors?: string[]) => {
        if (quantity < 1) {
            removeItem(id, selectedFlavors)
            return
        }
        setItems(prev => prev.map(i => {
            if (i.selectedFlavors && selectedFlavors) {
                if (i.id === id &&
                    JSON.stringify(i.selectedFlavors.sort()) === JSON.stringify(selectedFlavors.sort())) {
                    return { ...i, quantity }
                }
            } else if (i.id === id && !i.selectedFlavors && !selectedFlavors) {
                return { ...i, quantity }
            }
            return i
        }))
    }

    const clearCart = () => setItems([])

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            total,
            lastAddedProduct,
            showMiniCart,
            setShowMiniCart
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
