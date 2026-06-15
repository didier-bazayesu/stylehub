import { motion } from "motion/react";
import { STATS_DATA } from "./constants";
import type { StatItem } from "../../../types/home";

export default function StatsSection() {
  return (
    <section className="py-14 border-y dark:border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
        {STATS_DATA.map((item: StatItem, index: number) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="text-center"
          >
            <h3 className="text-3xl font-black dark:text-white">
              {item.value}
            </h3>
            <p className="text-gray-500">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
