import { Link } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { cn, formatCurrency, getProductPrimaryImage, truncate } from '@/lib/utils'
import { ROUTES } from '@/config/constants'
import type {  Product, ProductListItem } from '@/types'

interface ProductCardProps {
  product: ProductListItem | Product;
  isWishlisted?: boolean;
  onWishlistToggle?: (productId: string) => void;
  className?: string;
}

export function ProductCard({
  product,
  isWishlisted = false,
  onWishlistToggle,
  className,
}: ProductCardProps) {

    const imageUrl =
      "image" in product
        ? (product.image ?? "/placeholder-product.png")
        : getProductPrimaryImage((product as Product).images ?? []);

  const price = product.variants?.[0]?.price ?? product.base_price

  return (
    <article
      className={cn(
        "group relative flex flex-col bg-white dark:bg-gray-900",
        "rounded-xl border border-gray-100 dark:border-gray-800",
        "overflow-hidden transition-shadow hover:shadow-md",
        className,
      )}
    >
      {/* Image */}
      <Link
        to={ROUTES.PRODUCT(product.slug)}
        className="relative block aspect-square overflow-hidden bg-gray-50"
        tabIndex={-1}
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.is_featured && (
          <span className="absolute left-2 top-2 rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
            Featured
          </span>
        )}
      </Link>

      {/* Wishlist button */}
      {onWishlistToggle && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle(product.id);
          }}
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full",
            "bg-white/90 backdrop-blur-sm transition-colors dark:bg-gray-900/90",
            "hover:bg-white dark:hover:bg-gray-800",
            isWishlisted ? "text-red-500" : "text-gray-400 hover:text-gray-600",
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </button>
      )}

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.vendor?.store?.name && (
          <Link
            to={ROUTES.STORE(product.vendor.store.slug)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {product.vendor.store.name}
          </Link>
        )}
        <Link
          to={ROUTES.PRODUCT(product.slug)}
          className="text-sm font-medium text-gray-900 hover:underline dark:text-gray-100"
        >
          {truncate(product.name, 48)}
        </Link>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(price)}
          </span>

          {product.review_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{product.avg_rating.toFixed(1)}</span>
              <span className="text-gray-400">({product.review_count})</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
