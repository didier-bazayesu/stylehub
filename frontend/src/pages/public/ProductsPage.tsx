import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useInfiniteProducts } from '@/api/hooks/useProducts'
import { useCategories } from '@/api/hooks'
import { ProductCard } from '@/components/shared/cards/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Loading'
import { NoResults, ErrorState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { ProductFilters } from '@/types'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filters: ProductFilters = {
    category: searchParams.get('category') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    sort: (searchParams.get('sort') as ProductFilters['sort']) ?? 'newest',
    minPrice: searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined,
    limit: 20,
  }

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteProducts(filters)

  const allProducts = data?.pages.flatMap((p) => p.data) ?? []

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
        return next
      })
    },
    [setSearchParams],
  )

  const clearAllFilters = () => setSearchParams({})

  const hasActiveFilters = Boolean(
    filters.category || filters.search || filters.minPrice || filters.maxPrice,
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {filters.search ? `"${filters.search}"` : 'All Products'}
            </h1>
            {!isLoading && (
              <p className="text-sm text-gray-500">
                {allProducts.length} product{allProducts.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <select
              value={filters.sort ?? 'newest'}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Filter toggle */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => setFiltersOpen((v) => !v)}
            >
              Filters
              {hasActiveFilters && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white dark:bg-white dark:text-gray-900">
                  !
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {filters.category && (
              <Badge variant="outline">
                {filters.category}
                <button
                  onClick={() => updateFilter('category', null)}
                  aria-label="Remove category filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.minPrice && (
              <Badge variant="outline">
                Min ${filters.minPrice}
                <button onClick={() => updateFilter('minPrice', null)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.maxPrice && (
              <Badge variant="outline">
                Max ${filters.maxPrice}
                <button onClick={() => updateFilter('maxPrice', null)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-500 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Product grid */}
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(10)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : allProducts.length === 0 ? (
          <NoResults onClear={hasActiveFilters ? clearAllFilters : undefined} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load more */}
            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  isLoading={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
