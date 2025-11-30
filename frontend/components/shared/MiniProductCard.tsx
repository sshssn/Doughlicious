"use client"
import { Product } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { useRouter } from "next/navigation"

type MiniProductCardProps = {
  product: Product
  onProductClick?: () => void
}

export function MiniProductCard({ product, onProductClick }: MiniProductCardProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (onProductClick) {
      onProductClick()
    }
    router.push(`/product/${product.id}`)
  }

  return (
    <Link 
      href={`/product/${product.id}`}
      onClick={handleClick}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No Image</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{product.name}</p>
        <p className="text-primary font-semibold text-xs mt-0.5">{formatPrice(product.price)}</p>
      </div>
    </Link>
  )
}


