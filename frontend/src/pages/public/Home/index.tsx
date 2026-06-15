import { useCategories } from "@/api/hooks";
import { useFeaturedProducts, useProducts } from "@/api/hooks/useProducts";
import { ROUTES } from "@/config/constants";
import type { Category } from "@/types";

import HeroSection from "./HeroSection";
import CategoriesSection from "./CategoriesSection";
import ProductsSection from "./ProductsSection";
import StatsSection from "./StatsSection";
import VideoSection from "./VideoSection";
import CTASection from "./CTASection";
import ChatBot from "./ChatBot";

function filterRealCategories(cats: Category[]): Category[] {
  return cats.filter(
    (c) =>
      !c.slug.startsWith("test-") &&
      !c.name.toLowerCase().includes("test") &&
      !c.name.toLowerCase().includes("seed"),
  );
}

export default function HomePage() {
  const { data: allCategories, isLoading: categoriesLoading } = useCategories();
  const { data: featuredData, isLoading: featuredLoading } =
    useFeaturedProducts();
  const { data: latestData, isLoading: latestLoading } = useProducts({
    sort: "newest" as const,
    limit: 10,
  });

  const categories: Category[] = allCategories
    ? filterRealCategories(allCategories)
    : [];
  const featuredProducts =
    featuredData && featuredData.length
      ? featuredData
      : (latestData?.data ?? []);
  const productsLoading: boolean =
    featuredLoading || (featuredData?.length === 0 && latestLoading);

  const sectionTitle: string = featuredData?.length
    ? "Featured Picks"
    : "New Arrivals";
  const sectionLink: string = featuredData?.length
    ? `${ROUTES.PRODUCTS}?sort=featured`
    : `${ROUTES.PRODUCTS}?sort=newest`;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <HeroSection />
      <CategoriesSection
        categories={categories}
        isLoading={categoriesLoading}
      />
      <ProductsSection
        products={featuredProducts}
        isLoading={productsLoading}
        title={sectionTitle}
        viewAllLink={sectionLink}
      />
      <StatsSection />
      <VideoSection />
      <CTASection />
      <ChatBot />
    </div>
  );
}
