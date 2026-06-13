import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCategories } from "@/api/hooks";
import { useFeaturedProducts, useProducts } from "@/api/hooks/useProducts";
import { ProductCard } from "@/components/shared/cards/ProductCard";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/constants";
import type { Category } from "@/types";

// ─── Hero slides ──────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    label: "Women's Collection",
    sub: "New season essentials",
  },
  {
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
    label: "Street Style",
    sub: "Independent designers",
  },
  {
    url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=80",
    label: "Boutique Brands",
    sub: "Curated just for you",
  },
  {
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80",
    label: "Summer 2026",
    sub: "Fresh arrivals every week",
  },
];

// ─── Category emoji/gradient fallbacks ───────────────────────────────────────

const CATEGORY_CONFIG: Record<
  string,
  { emoji: string; gradient: string; bg: string }
> = {
  women: {
    emoji: "👗",
    gradient: "from-pink-400 to-rose-600",
    bg: "bg-pink-50 dark:bg-pink-950",
  },
  men: {
    emoji: "👔",
    gradient: "from-blue-400 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  kids: {
    emoji: "🧸",
    gradient: "from-yellow-400 to-orange-500",
    bg: "bg-yellow-50 dark:bg-yellow-950",
  },
  shoes: {
    emoji: "👟",
    gradient: "from-green-400 to-teal-600",
    bg: "bg-green-50 dark:bg-green-950",
  },
  accessories: {
    emoji: "👜",
    gradient: "from-purple-400 to-violet-600",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
  bags: {
    emoji: "👜",
    gradient: "from-amber-400 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  sport: {
    emoji: "🏃",
    gradient: "from-lime-400 to-green-600",
    bg: "bg-lime-50 dark:bg-lime-950",
  },
  default: {
    emoji: "✨",
    gradient: "from-gray-400 to-gray-600",
    bg: "bg-gray-50 dark:bg-gray-900",
  },
};

function getCategoryConfig(slug: string) {
  const key = Object.keys(CATEGORY_CONFIG).find((k) =>
    slug.toLowerCase().includes(k),
  );
  return CATEGORY_CONFIG[key ?? "default"];
}

// ─── Filter real categories (remove test / seed data) ────────────────────────

function filterRealCategories(cats: Category[]): Category[] {
  return cats.filter(
    (c) =>
      !c.slug.startsWith("test-") &&
      !c.name.toLowerCase().includes("test") &&
      !c.name.toLowerCase().includes("seed"),
  );
}

// ─── Hero component ───────────────────────────────────────────────────────────

function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = (next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(next);
      setAnimating(false);
    }, 300);
  };

  const prev = () =>
    go((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => go((current + 1) % HERO_SLIDES.length);

  // Auto-advance
  useEffect(() => {
    const t = setInterval(() => go((current + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [current]);

  const slide = HERO_SLIDES[current];

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-black">
      {/* Background images */}
      {HERO_SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${s.url})`,
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

      {/* Content */}
      <div
        className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-8 transition-opacity duration-300 ${
          animating ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="text-xs tracking-[0.3em] uppercase text-white/50 mb-4">
          {slide.sub}
        </p>
        <h1 className="text-6xl sm:text-8xl font-extrabold leading-none text-white">
          {slide.label.split(" ")[0]}
          <span className="block text-white/50">
            {slide.label.split(" ").slice(1).join(" ")}
          </span>
        </h1>
        <p className="mt-6 text-white/60 max-w-md text-base">
          Curated independent fashion, boutique brands, and modern streetwear —
          all in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button size="lg" asChild>
            <Link to={ROUTES.PRODUCTS}>Shop Now</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 dark:border-white/30"
            asChild
          >
            <Link to={`${ROUTES.PRODUCTS}?sort=newest`}>New Arrivals</Link>
          </Button>
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        {/* Dots */}
        <div className="flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-white" : "w-2 bg-white/30"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Arrow controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { data: allCategories, isLoading: categoriesLoading } = useCategories();
  const { data: featuredData, isLoading: featuredLoading } =
    useFeaturedProducts();
   

  // Fallback: if featured returns empty, use latest products
  const { data: latestData, isLoading: latestLoading } = useProducts({
    sort: "newest",
    limit: 10,
  });

  // Filter out test/seed categories, show real ones only
  const categories = allCategories ? filterRealCategories(allCategories) : [];


  // Use featured if available, otherwise fall back to latest products
  const featuredProducts =
    featuredData && featuredData.length > 0
      ? featuredData
      : (latestData?.data ?? []);

  const productsLoading =
    featuredLoading || (featuredData?.length === 0 && latestLoading);

  const sectionTitle =
    featuredData && featuredData.length > 0 ? "Featured Picks" : "New Arrivals";

  const sectionLink =
    featuredData && featuredData.length > 0
      ? `${ROUTES.PRODUCTS}?sort=featured`
      : `${ROUTES.PRODUCTS}?sort=newest`;
     

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <HeroSection />

      {/* ── Categories ── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Shop by Category
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Find exactly what you're looking for
              </p>
            </div>
            <Link
              to={ROUTES.PRODUCTS}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categoriesLoading
              ? [...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-36 rounded-2xl" />
                ))
              : categories.slice(0, 10).map((cat) => {
                  const config = getCategoryConfig(cat.slug);
                  return (
                    <Link
                      key={cat.id}
                      to={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
                      className="group relative h-36 overflow-hidden rounded-2xl"
                    >
                      {cat.image_url ? (
                        /* Real image from backend */
                        <>
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />
                        </>
                      ) : (
                        /* Gradient fallback with emoji */
                        <>
                          <div
                            className={`h-full w-full bg-gradient-to-br ${config.gradient} transition-transform duration-500 group-hover:scale-105`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl opacity-80 transition-transform duration-300 group-hover:scale-110">
                              {config.emoji}
                            </span>
                          </div>
                        </>
                      )}
                      {/* Label */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-6">
                        <span className="text-sm font-semibold text-white">
                          {cat.name}
                        </span>
                      </div>
                    </Link>
                  );
                })}
          </div>

          {/* Empty state */}
          {!categoriesLoading && categories.length === 0 && (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <span className="text-4xl mb-3">🗂️</span>
              <p className="text-sm">No categories yet</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Featured / New Arrivals ── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {sectionTitle}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {featuredData && featuredData.length > 0
                  ? "Hand-picked by our team"
                  : "Just added to the platform"}
              </p>
            </div>
            <Link
              to={sectionLink}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="relative">
            {/* Mobile: horizontal scroll */}
            <div
              className="flex gap-4 overflow-x-auto pb-4 lg:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {productsLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="min-w-[200px]">
                    <ProductCardSkeleton />
                  </div>
                ))
              ) : featuredProducts.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-gray-400 w-full">
                  <span className="text-4xl mb-3">🛍️</span>
                  <p className="text-sm">Products are on their way</p>
                </div>
              ) : (
                featuredProducts.slice(0, 10).map((p) => (
                  <div key={p.id} className="min-w-[200px]">
                    <ProductCard product={p} />
                  </div>
                ))
              )}
            </div>

            {/* Desktop: grid */}
            <div className="hidden lg:grid grid-cols-5 gap-4">
              {productsLoading ? (
                [...Array(5)].map((_, i) => <ProductCardSkeleton key={i} />)
              ) : featuredProducts.length === 0 ? (
                <div className="col-span-5 flex flex-col items-center py-16 text-gray-400">
                  <span className="text-5xl mb-3">🛍️</span>
                  <p className="text-sm">No products yet — check back soon</p>
                  <Link
                    to={ROUTES.PRODUCTS}
                    className="mt-4 text-xs font-medium text-gray-700 hover:underline dark:text-gray-300"
                  >
                    Browse all products
                  </Link>
                </div>
              ) : (
                featuredProducts
                  .slice(0, 10)
                  .map((p) => <ProductCard key={p.id} product={p}/>)
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="py-14 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "500+", label: "Independent Brands" },
              { value: "10K+", label: "Products" },
              { value: "50K+", label: "Happy Customers" },
              { value: "4.9★", label: "Average Rating" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vendor CTA ── */}
      <section className="relative overflow-hidden bg-gray-950 py-28 text-white">
        {/* Background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#374151_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-widest uppercase">
            For Creators & Sellers
          </span>
          <h2 className="text-4xl font-extrabold sm:text-5xl">
            Sell on StyleHub
          </h2>
          <p className="mt-4 text-gray-400">
            Join independent designers and boutiques reaching customers
            worldwide. Set up your store in minutes — no technical skills
            needed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to={ROUTES.REGISTER}>Start Selling</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link to={ROUTES.PRODUCTS}>Browse Stores</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
