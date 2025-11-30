export interface Product {
    id: string
    name: string
    description: string
    price: number
    category: string
    imageUrl: string
    stock: number
    isActive: boolean
    packSize?: number | null // 1 = single, 6, 12, 24 for packs
}

export interface CartItem extends Product {
    quantity: number
    selectedFlavors?: string[] // Array of flavor product IDs for pack products
}
