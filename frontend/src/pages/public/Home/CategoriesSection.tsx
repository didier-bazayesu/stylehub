import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/Loading";
import { ROUTES } from "@/config/constants";
import { CATEGORY_CONFIG } from "./constants";
import type { CategoriesSectionProps } from "../../../types/home";
import type { Category } from "@/types";

function getCategoryConfig(slug: string): {
  emoji: string;
  gradient: string;
  bg: string;
} {
  const key = Object.keys(CATEGORY_CONFIG).find((k) =>
    slug.toLowerCase().includes(k),
  );
  return CATEGORY_CONFIG[key ?? "default"];
}

export default function CategoriesSection({
  categories,
  isLoading,
}: CategoriesSectionProps) {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            <p className="text-gray-500">
              Find exactly what you're looking for
            </p>
          </div>
          <Link to={ROUTES.PRODUCTS} className="flex gap-2 items-center">
            View all <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoading
            ? [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))
            : categories.slice(0, 10).map((cat: Category, index: number) => {
                const config = getCategoryConfig(cat.slug);
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ scale: 1.05, y: -8 }}
                  >
                    <Link
                      to={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
                      className="group relative block h-36 rounded-2xl overflow-hidden"
                    >
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                          alt={cat.name}
                        />
                      ) : (
                        <div
                          className={`h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
                        >
                          <span className="text-5xl">{config.emoji}</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3 text-white">
                        {cat.name}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
