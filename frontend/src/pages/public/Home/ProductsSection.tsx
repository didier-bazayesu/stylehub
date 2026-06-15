import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ProductCard } from "@/components/shared/cards/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Loading";
import type { ProductsSectionProps } from "../../../types/home";

export default function ProductsSection({
  products,
  isLoading,
  title,
  viewAllLink,
}: ProductsSectionProps) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-between mb-10"
        >
          <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
          <Link to={viewAllLink}>View all</Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading
            ? [...Array(5)].map((_, i) => <ProductCardSkeleton key={i} />)
            : products.slice(0, 10).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -10 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
