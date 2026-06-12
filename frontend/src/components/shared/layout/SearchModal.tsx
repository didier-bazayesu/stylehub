import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { useUIStore } from '@/store'
import { useScrollLock } from '@/hooks'
import { useDebounce } from '@/hooks'
import { useProducts } from '@/api/hooks/useProducts'
import { cn, formatCurrency, getProductPrimaryImage, truncate } from '@/lib/utils'
import { ROUTES } from '@/config/constants'

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useUIStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 350)
  const inputRef = useRef<HTMLInputElement>(null)
  useScrollLock(searchOpen)

  const { data, isLoading } = useProducts({
    search: debouncedQuery || undefined,
    limit: 6,
  })

  const results = data?.data ?? []

  useEffect(() => {
    if (searchOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
      // Cmd/Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [searchOpen, setSearchOpen])

  const handleSelect = (slug: string) => {
    setSearchOpen(false)
    navigate(ROUTES.PRODUCT(slug))
  }

  const handleSearchAll = () => {
    setSearchOpen(false)
    navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query)}`)
  }

  if (!searchOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setSearchOpen(false)}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 dark:border-gray-800">
          <Search className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, stores…"
            className="flex-1 py-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent dark:text-gray-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query) handleSearchAll()
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-400 sm:block dark:border-gray-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {debouncedQuery && (
          <div className="max-h-80 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                Searching…
              </div>
            ) : !results.length ? (
              <div className="py-8 text-center text-sm text-gray-400">
                No results for "{debouncedQuery}"
              </div>
            ) : (
              <>
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product.slug)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={getProductPrimaryImage(product.images ?? [])}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {truncate(product.name, 50)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {product.category?.name}
                        {product.vendor?.store && ` · ${product.vendor.store.name}`}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {formatCurrency(product.base_price)}
                    </span>
                  </button>
                ))}

                {/* View all results */}
                <button
                  onClick={handleSearchAll}
                  className="mt-1 flex w-full items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <span>
                    See all results for <strong className="text-gray-900 dark:text-white">"{debouncedQuery}"</strong>
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Empty state / hints */}
        {!debouncedQuery && (
          <div className="px-4 py-6 text-center text-xs text-gray-400">
            Type to search products and stores
          </div>
        )}
      </div>
    </div>
  )
}
