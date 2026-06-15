import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/constants";
import { HERO_SLIDES } from "./constants";
import type { HeroSlide } from "../../../types/home";

export default function HeroSection() {
  const [current, setCurrent] = useState<number>(0);
  const slide: HeroSlide = HERO_SLIDES[current];

  const next = (): void => {
    setCurrent((c) => (c + 1) % HERO_SLIDES.length);
  };

  const prev = (): void => {
    setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-black flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.url}
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.url})` }}
        />
      </AnimatePresence>

      <motion.div
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"
      />

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-7xl mx-auto px-6"
      >
        <motion.p
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs uppercase tracking-[0.3em] text-white/50"
        >
          {slide.sub}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="text-6xl sm:text-8xl font-black text-white"
        >
          {slide.label.split(" ")[0]}
          <span className="block text-white/50">
            {slide.label.split(" ").slice(1).join(" ")}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 max-w-md text-white/60"
        >
          Curated independent fashion, boutique brands and modern streetwear —
          all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: "spring" }}
          className="mt-8 flex gap-4"
        >
          <Button size="lg" asChild>
            <Link to={ROUTES.PRODUCTS}>Shop Now</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/30 text-white"
            asChild
          >
            <Link to={`${ROUTES.PRODUCTS}?sort=newest`}>New Arrivals</Link>
          </Button>
        </motion.div>
      </motion.div>

      <button
        onClick={prev}
        className="absolute left-5 top-1/2 z-20 text-white -translate-y-1/2"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-5 top-1/2 z-20 text-white -translate-y-1/2"
      >
        <ChevronRight />
      </button>
    </section>
  );
}
