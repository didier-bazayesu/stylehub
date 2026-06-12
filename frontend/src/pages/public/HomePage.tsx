import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useCategories } from '@/api/hooks'
import { useFeaturedProducts } from '@/api/hooks/useProducts'
import { ProductCard } from '@/components/shared/cards/ProductCard'
import { ProductCardSkeleton, Skeleton } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/config/constants'

export default function HomePage() {
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: featured, isLoading: featuredLoading } = useFeaturedProducts()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#3b3b3b_0%,_transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-gray-400">
            New season, new looks
          </p>
          <h1 className="text-5xl font-black leading-none tracking-tight text-white sm:text-7xl">
            Fashion
            <br />
            <span className="text-gray-500">Reimagined.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-gray-400">
            Discover curated clothing from independent designers and boutique stores — all in one place.
          </p>
          <div className="mt-8 flex gap-3">
            <Button size="lg" asChild>
              <Link to={ROUTES.PRODUCTS}>Shop now</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white" asChild>
              <Link to={`${ROUTES.PRODUCTS}?sort=newest`}>New arrivals</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
            <Link to={ROUTES.PRODUCTS} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categoriesLoading
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              : categories?.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className="h-24 w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl">
                          👗
                        </div>
                      )}
                    </div>
                    <span className="text-center text-sm font-medium text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white">
                      {cat.name}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-gray-50 py-16 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Picks</h2>
            <Link
              to={`${ROUTES.PRODUCTS}?is_featured=true`}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {featuredLoading
              ? [...Array(5)].map((_, i) => <ProductCardSkeleton key={i} />)
              : featured?.slice(0, 10).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
          </div>
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="bg-gray-900 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white">Sell on StyleHub</h2>
          <p className="mt-3 text-gray-400">
            Join thousands of independent designers reaching customers worldwide. Set up your store in minutes.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link to={ROUTES.REGISTER}>Start selling</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800" asChild>
              <Link to={ROUTES.PRODUCTS}>Browse stores</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
