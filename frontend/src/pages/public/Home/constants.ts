import { HeroSlide, CategoryConfig, StatItem } from '../../../types/home';

export const HERO_SLIDES: HeroSlide[] = [
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

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
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
  default: {
    emoji: "✨",
    gradient: "from-gray-400 to-gray-600",
    bg: "bg-gray-50 dark:bg-gray-900",
  },
};

export const STATS_DATA: StatItem[] = [
  { value: "500+", label: "Independent Brands" },
  { value: "10K+", label: "Products" },
  { value: "50K+", label: "Happy Customers" },
  { value: "4.9★", label: "Average Rating" },
];