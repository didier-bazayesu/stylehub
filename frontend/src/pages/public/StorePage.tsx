import { useParams, Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useStore } from '@/api/hooks'
import { useInfiniteProducts } from '@/api/hooks/useProducts'
import { ProductCard } from '@/components/shared/cards/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/EmptyState'
import { ROUTES } from '@/config/constants'

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: store, isLoading: storeLoading, isError } = useStore(slug ?? '')
  const {
    data,
    isLoading: productsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({ vendor: slug })

  const products = data?.pages.flatMap((p) => p.data) ?? []

  if (isError) return <ErrorState />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Banner */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
        {store?.banner_url && (
          <img src={store.banner_url} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Store info */}
        <div className="-mt-12 mb-8 flex items-end gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-sm dark:border-gray-900 dark:bg-gray-900">
            {store?.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-300">
                {store?.name?.charAt(0) ?? '?'}
              </div>
            )}
          </div>
          <div className="pb-1">
            {storeLoading ? (
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            ) : (
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{store?.name}</h1>
            )}
            {store?.description && (
              <p className="mt-0.5 text-sm text-gray-500">{store.description}</p>
            )}
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {productsLoading
            ? [...Array(10)].map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {hasNextPage && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" isLoading={isFetchingNextPage} onClick={() => fetchNextPage()}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
