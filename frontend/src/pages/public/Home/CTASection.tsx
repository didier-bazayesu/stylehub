import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/constants";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gray-950 py-28 text-white">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(circle,_#374151,_transparent_60%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-3xl mx-auto text-center px-6"
      >
        <h2 className="text-5xl font-black">Sell on StyleHub</h2>
        <p className="mt-5 text-gray-400">
          Join independent designers and boutiques reaching customers worldwide.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link to={ROUTES.REGISTER}>Start Selling</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
