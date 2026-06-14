import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingBag, Star, ChevronRight, Check } from 'lucide-react'
import { useProduct } from '@/api/hooks/useProducts'
import { useAddToCart } from '@/api/hooks/useCart'
import { useAddToWishlist, useRemoveFromWishlist, useWishlist, useReviews } from '@/api/hooks'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/EmptyState'

import {
  cn,
  formatCurrency,
  formatDate,
  getInitials,
  getProductPrimaryImage,
} from '@/lib/utils'
import { ROUTES } from '@/config/constants'
import { useAuthStore} from '@/store'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError, refetch } = useProduct(slug ?? '')
  const { data: reviews } = useReviews(product?.id ?? '')
  const { data: wishlist } = useWishlist()
  const { mutate: addToCart, isPending: addingToCart } = useAddToCart()
  const { mutate: addToWishlist } = useAddToWishlist()
  const { mutate: removeFromWishlist } = useRemoveFromWishlist()
  const { isAuthenticated } = useAuthStore()
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
 
  
  if (isLoading) return <PageLoader />
  if (isError || !product) return <ErrorState onRetry={() => refetch()} />

  const images = product.images ?? []
  const variants = product.variants ?? []
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0]
  const isWishlisted = wishlist?.items.some((i) => i.product_id === product.id) ?? false
  const price = selectedVariant?.price ?? product.base_price
  

  const handleWishlistToggle = () => {
    if (!isAuthenticated) return
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product.id)
    }
  }

const handleAddToCart = () => {
  if (!selectedVariant) return;
  addToCart({
    payload: { variant_id: selectedVariant.id, quantity },
    product,
    variant: selectedVariant,
  });
};

  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))]
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-gray-400">
        <Link to={ROUTES.HOME} className="hover:text-gray-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={ROUTES.PRODUCTS} className="hover:text-gray-700">Products</Link>
        <ChevronRight className="h-3 w-3" />
        {product.category && (
          <>
            <Link to={`${ROUTES.PRODUCTS}?category=${product.category.slug}`} className="hover:text-gray-700">
              {product.category.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="flex gap-3">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex flex-col gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(i)}
                  className={cn(
                    'h-16 w-16 overflow-hidden rounded-lg border-2',
                    i === activeImageIndex
                      ? 'border-gray-900 dark:border-white'
                      : 'border-transparent',
                  )}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1 overflow-hidden rounded-2xl bg-gray-50">
            <img
              src={images[activeImageIndex]?.url ?? getProductPrimaryImage(images)}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Store */}
          {product.vendor?.store && (
            <Link
              to={ROUTES.STORE(product.vendor.store.slug)}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              {product.vendor.store.name}
            </Link>
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= Math.round(product.avg_rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200',
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.avg_rating.toFixed(1)} ({product.review_count} reviews)
                </span>
              </div>
            )}
          </div>

          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(price)}
          </p>

          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {product.description}
          </p>

          {/* Color selector */}
          {colors.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const variantWithColor = variants.find((v) => v.color === color)
                  const isSelected = selectedVariant?.color === color
                  return (
                    <button
                      key={color}
                      onClick={() => variantWithColor && setSelectedVariantId(variantWithColor.id)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                        isSelected
                          ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                          : 'border-gray-200 text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300',
                      )}
                    >
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Size selector */}
          {sizes.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const variantWithSize = variants.find(
                    (v) => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color),
                  )
                  const isSelected = selectedVariant?.size === size
                  const outOfStock = variantWithSize?.stock === 0

                  return (
                    <button
                      key={size}
                      onClick={() => variantWithSize && setSelectedVariantId(variantWithSize.id)}
                      disabled={outOfStock}
                      className={cn(
                        'h-10 min-w-[2.5rem] rounded-lg border px-3 text-sm font-medium transition-colors',
                        isSelected
                          ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                          : 'border-gray-200 text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300',
                        outOfStock && 'cursor-not-allowed line-through opacity-40',
                      )}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stock badge */}
          {selectedVariant && (
            <div className="flex items-center gap-1.5">
              {selectedVariant.stock > 0 ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600">
                    {selectedVariant.stock > 10
                      ? 'In stock'
                      : `Only ${selectedVariant.stock} left`}
                  </span>
                </>
              ) : (
                <Badge variant="danger">Out of stock</Badge>
              )}
            </div>
          )}

          {/* Quantity + CTA */}
          <div className="flex gap-3">
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(selectedVariant?.stock ?? 99, q + 1),
                  )
                }
                className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                +
              </button>
            </div>

            <Button
              fullWidth
              leftIcon={<ShoppingBag className="h-4 w-4" />}
              isLoading={addingToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              onClick={handleAddToCart}
            >
              Add to cart
            </Button>

            <button
              onClick={handleWishlistToggle}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                'transition-colors dark:border-gray-700',
                isWishlisted
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600',
              )}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <section className="mt-16">
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          Customer reviews
          {reviews?.length ? (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({reviews.length})
            </span>
          ) : null}
        </h2>

        {!reviews?.length ? (
          <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {review.user
                      ? getInitials(review.user.first_name, review.user.last_name)
                      : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {review.user
                        ? `${review.user.first_name} ${review.user.last_name}`
                        : 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            'h-3 w-3',
                            s <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-200 text-gray-200',
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {review.is_verified_purchase && (
                    <Badge variant="success" size="sm" className="ml-auto">
                      Verified
                    </Badge>
                  )}
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">{formatDate(review.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
