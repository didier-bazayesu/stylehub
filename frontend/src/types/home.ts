import { Category, Product } from "@/types";

export interface HeroSlide {
  url: string;
  label: string;
  sub: string;
}

export interface CategoryConfig {
  emoji: string;
  gradient: string;
  bg: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface ProductsSectionProps {
  products: Product[];
  isLoading: boolean;
  title: string;
  viewAllLink: string;
}

export interface CategoriesSectionProps {
  categories: Category[];
  isLoading: boolean;
}