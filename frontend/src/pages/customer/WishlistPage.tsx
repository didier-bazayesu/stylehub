// WishlistPage.tsx
import { Heart } from 'lucide-react'
import { useWishlist, useRemoveFromWishlist } from '@/api/hooks'
import { ProductCard } from '@/components/shared/cards/ProductCard'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist()
  const { mutate: remove } = useRemoveFromWishlist()

  if (isLoading) return <PageLoader />
  const items = wishlist?.items ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
        Wishlist <span className="text-gray-400">({items.length})</span>
      </h1>
      {!items.length ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="Your wishlist is empty"
          description="Save products you love by clicking the heart icon."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={item.product}
              isWishlisted
              onWishlistToggle={() => remove(item.product_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
