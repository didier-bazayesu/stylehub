// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
// import { motion, AnimatePresence } from "motion/react";

// import { useCategories } from "@/api/hooks";
// import { useFeaturedProducts, useProducts } from "@/api/hooks/useProducts";

// import { ProductCard } from "@/components/shared/cards/ProductCard";
// import { ProductCardSkeleton, Skeleton } from "@/components/ui/Loading";

// import { Button } from "@/components/ui/Button";
// import { ROUTES } from "@/config/constants";
// import ChatInput from "@/components/Aishop";

// import type { Category } from "@/types";

// const HERO_SLIDES = [
//   {
//     url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
//     label: "Women's Collection",
//     sub: "New season essentials",
//   },
//   {
//     url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
//     label: "Street Style",
//     sub: "Independent designers",
//   },
//   {
//     url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=80",
//     label: "Boutique Brands",
//     sub: "Curated just for you",
//   },
//   {
//     url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80",
//     label: "Summer 2026",
//     sub: "Fresh arrivals every week",
//   },
// ];

// const CATEGORY_CONFIG: Record<
//   string,
//   { emoji: string; gradient: string; bg: string }
// > = {
//   women: {
//     emoji: "👗",
//     gradient: "from-pink-400 to-rose-600",
//     bg: "bg-pink-50 dark:bg-pink-950",
//   },

//   men: {
//     emoji: "👔",
//     gradient: "from-blue-400 to-indigo-600",
//     bg: "bg-blue-50 dark:bg-blue-950",
//   },

//   kids: {
//     emoji: "🧸",
//     gradient: "from-yellow-400 to-orange-500",
//     bg: "bg-yellow-50 dark:bg-yellow-950",
//   },

//   shoes: {
//     emoji: "👟",
//     gradient: "from-green-400 to-teal-600",
//     bg: "bg-green-50 dark:bg-green-950",
//   },

//   accessories: {
//     emoji: "👜",
//     gradient: "from-purple-400 to-violet-600",
//     bg: "bg-purple-50 dark:bg-purple-950",
//   },

//   default: {
//     emoji: "✨",
//     gradient: "from-gray-400 to-gray-600",
//     bg: "bg-gray-50 dark:bg-gray-900",
//   },
// };

// function getCategoryConfig(slug: string) {
//   const key = Object.keys(CATEGORY_CONFIG).find((k) =>
//     slug.toLowerCase().includes(k),
//   );

//   return CATEGORY_CONFIG[key ?? "default"];
// }

// function filterRealCategories(cats: Category[]) {
//   return cats.filter(
//     (c) =>
//       !c.slug.startsWith("test-") &&
//       !c.name.toLowerCase().includes("test") &&
//       !c.name.toLowerCase().includes("seed"),
//   );
// }

// function HeroSection() {
//   const [current, setCurrent] = useState(0);

//   const slide = HERO_SLIDES[current];

//   const next = () => {
//     setCurrent((c) => (c + 1) % HERO_SLIDES.length);
//   };

//   const prev = () => {
//     setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
//   };

//   useEffect(() => {
//     const timer = setInterval(next, 6000);

//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <section
//       className="
//     relative min-h-[88vh]
//     overflow-hidden
//     bg-black
//     flex items-center
//     "
//     >
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={slide.url}
//           initial={{
//             opacity: 0,
//             scale: 1.2,
//           }}
//           animate={{
//             opacity: 1,
//             scale: 1,
//           }}
//           exit={{
//             opacity: 0,
//             scale: 1.05,
//           }}
//           transition={{
//             duration: 1.2,
//           }}
//           className="
//     absolute inset-0
//     bg-cover bg-center
//     "
//           style={{
//             backgroundImage: `url(${slide.url})`,
//           }}
//         />
//       </AnimatePresence>

//       <motion.div
//         animate={{
//           opacity: [0.5, 0.8, 0.5],
//         }}
//         transition={{
//           duration: 5,
//           repeat: Infinity,
//         }}
//         className="
//     absolute inset-0
//     bg-gradient-to-r
//     from-black/80
//     via-black/50
//     to-transparent
//     "
//       />

//       <motion.div
//         initial={{
//           opacity: 0,
//           y: 80,
//         }}
//         animate={{
//           opacity: 1,
//           y: 0,
//         }}
//         transition={{
//           duration: 0.8,
//         }}
//         className="
//     relative z-10
//     max-w-7xl
//     mx-auto
//     px-6
//     "
//       >
//         <motion.p
//           initial={{
//             opacity: 0,
//             x: -40,
//           }}
//           animate={{
//             opacity: 1,
//             x: 0,
//           }}
//           transition={{
//             delay: 0.3,
//           }}
//           className="
//     text-xs
//     uppercase
//     tracking-[0.3em]
//     text-white/50
//     "
//         >
//           {slide.sub}
//         </motion.p>

//         <motion.h1
//           initial={{
//             opacity: 0,
//             y: 40,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//           }}
//           transition={{
//             delay: 0.4,
//             type: "spring",
//           }}
//           className="
//     text-6xl
//     sm:text-8xl
//     font-black
//     text-white
//     "
//         >
//           {slide.label.split(" ")[0]}

//           <span className="block text-white/50">
//             {slide.label.split(" ").slice(1).join(" ")}
//           </span>
//         </motion.h1>

//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{
//             delay: 0.7,
//           }}
//           className="
//     mt-6
//     max-w-md
//     text-white/60
//     "
//         >
//           Curated independent fashion, boutique brands and modern streetwear —
//           all in one place.
//         </motion.p>

//         <motion.div
//           initial={{
//             opacity: 0,
//             scale: 0.8,
//           }}
//           animate={{
//             opacity: 1,
//             scale: 1,
//           }}
//           transition={{
//             delay: 0.9,
//             type: "spring",
//           }}
//           className="
//     mt-8 flex gap-4
//     "
//         >
//           <Button size="lg" asChild>
//             <Link to={ROUTES.PRODUCTS}>Shop Now</Link>
//           </Button>

//           <Button
//             variant="outline"
//             size="lg"
//             className="
//     border-white/30
//     text-white
//     "
//             asChild
//           >
//             <Link to={`${ROUTES.PRODUCTS}?sort=newest`}>New Arrivals</Link>
//           </Button>
//         </motion.div>
//       </motion.div>

//       <button
//         onClick={prev}
//         className="
//     absolute left-5 top-1/2
//     z-20
//     text-white
//     "
//       >
//         <ChevronLeft />
//       </button>

//       <button
//         onClick={next}
//         className="
//     absolute right-5 top-1/2
//     z-20
//     text-white
//     "
//       >
//         <ChevronRight />
//       </button>
//     </section>
//   );
// }
// export default function HomePage() {
//   const { data: allCategories, isLoading: categoriesLoading } = useCategories();

//   const { data: featuredData, isLoading: featuredLoading } =
//     useFeaturedProducts();

//   const { data: latestData, isLoading: latestLoading } = useProducts({
//     sort: "newest",
//     limit: 10,
//   });

//   const categories = allCategories ? filterRealCategories(allCategories) : [];

//   const featuredProducts =
//     featuredData && featuredData.length
//       ? featuredData
//       : (latestData?.data ?? []);

//   const productsLoading =
//     featuredLoading || (featuredData?.length === 0 && latestLoading);

//   const sectionTitle = featuredData?.length ? "Featured Picks" : "New Arrivals";

//   const sectionLink = featuredData?.length
//     ? `${ROUTES.PRODUCTS}?sort=featured`
//     : `${ROUTES.PRODUCTS}?sort=newest`;

//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-950">
//       <HeroSection />

//       {/* Categories */}

//       <section
//         className="
//     py-20
//     bg-white
//     dark:bg-gray-950
//     "
//       >
//         <div
//           className="
//     mx-auto
//     max-w-7xl
//     px-6
//     "
//         >
//           <motion.div
//             initial={{
//               opacity: 0,
//               y: 30,
//             }}
//             whileInView={{
//               opacity: 1,
//               y: 0,
//             }}
//             viewport={{ once: true }}
//             className="
//     mb-10
//     flex
//     justify-between
//     "
//           >
//             <div>
//               <h2
//                 className="
//     text-2xl
//     font-bold
//     text-gray-900
//     dark:text-white
//     "
//               >
//                 Shop by Category
//               </h2>

//               <p className="text-gray-500">
//                 Find exactly what you're looking for
//               </p>
//             </div>

//             <Link
//               to={ROUTES.PRODUCTS}
//               className="
//     flex
//     gap-2
//     items-center
//     "
//             >
//               View all
//               <ArrowRight size={16} />
//             </Link>
//           </motion.div>

//           <div
//             className="
//     grid
//     grid-cols-2
//     md:grid-cols-4
//     lg:grid-cols-5
//     gap-4
//     "
//           >
//             {categoriesLoading
//               ? [...Array(5)].map((_, i) => (
//                   <Skeleton key={i} className="h-36 rounded-2xl" />
//                 ))
//               : categories.slice(0, 10).map((cat, index) => {
//                   const config = getCategoryConfig(cat.slug);

//                   return (
//                     <motion.div
//                       key={cat.id}
//                       initial={{
//                         opacity: 0,
//                         y: 40,
//                       }}
//                       whileInView={{
//                         opacity: 1,
//                         y: 0,
//                       }}
//                       viewport={{
//                         once: true,
//                       }}
//                       transition={{
//                         delay: index * 0.08,
//                       }}
//                       whileHover={{
//                         scale: 1.05,
//                         y: -8,
//                       }}
//                     >
//                       <Link
//                         to={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
//                         className="
//     group
//     relative
//     block
//     h-36
//     rounded-2xl
//     overflow-hidden
//     "
//                       >
//                         {cat.image_url ? (
//                           <img
//                             src={cat.image_url}
//                             className="
//     w-full
//     h-full
//     object-cover
//     group-hover:scale-110
//     transition
//     "
//                           />
//                         ) : (
//                           <div
//                             className={`
//     h-full
//     bg-gradient-to-br
//     ${config.gradient}
//     flex
//     items-center
//     justify-center
//     `}
//                           >
//                             <span className="text-5xl">{config.emoji}</span>
//                           </div>
//                         )}

//                         <div
//                           className="
//     absolute
//     bottom-0
//     left-0
//     right-0
//     bg-black/50
//     p-3
//     text-white
//     "
//                         >
//                           {cat.name}
//                         </div>
//                       </Link>
//                     </motion.div>
//                   );
//                 })}
//           </div>
//         </div>
//       </section>

//       {/* Products */}

//       <section
//         className="
//     py-20
//     bg-gray-50
//     dark:bg-gray-900
//     "
//       >
//         <div
//           className="
//     max-w-7xl
//     mx-auto
//     px-6
//     "
//         >
//           <motion.div
//             initial={{
//               opacity: 0,
//               y: 30,
//             }}
//             whileInView={{
//               opacity: 1,
//               y: 0,
//             }}
//             viewport={{
//               once: true,
//             }}
//             className="
//     flex
//     justify-between
//     mb-10
//     "
//           >
//             <h2
//               className="
//     text-2xl
//     font-bold
//     dark:text-white
//     "
//             >
//               {sectionTitle}
//             </h2>

//             <Link to={sectionLink}>View all</Link>
//           </motion.div>

//           <div
//             className="
//     grid
//     grid-cols-2
//     md:grid-cols-3
//     lg:grid-cols-5
//     gap-4
//     "
//           >
//             {productsLoading
//               ? [...Array(5)].map((_, i) => <ProductCardSkeleton key={i} />)
//               : featuredProducts.slice(0, 10).map((product, index) => (
//                   <motion.div
//                     key={product.id}
//                     initial={{
//                       opacity: 0,
//                       y: 50,
//                     }}
//                     whileInView={{
//                       opacity: 1,
//                       y: 0,
//                     }}
//                     viewport={{
//                       once: true,
//                     }}
//                     transition={{
//                       delay: index * 0.08,
//                     }}
//                     whileHover={{
//                       y: -10,
//                     }}
//                   >
//                     <ProductCard product={product} />
//                   </motion.div>
//                 ))}
//           </div>
//         </div>
//       </section>

//       {/* Stats */}

//       <section
//         className="
//     py-14
//     border-y
//     dark:border-gray-800
//     "
//       >
//         <div
//           className="
//     max-w-7xl
//     mx-auto
//     grid
//     grid-cols-2
//     md:grid-cols-4
//     gap-8
//     px-6
//     "
//         >
//           {[
//             {
//               value: "500+",
//               label: "Independent Brands",
//             },
//             {
//               value: "10K+",
//               label: "Products",
//             },
//             {
//               value: "50K+",
//               label: "Happy Customers",
//             },
//             {
//               value: "4.9★",
//               label: "Average Rating",
//             },
//           ].map((item, index) => (
//             <motion.div
//               key={item.label}
//               initial={{
//                 opacity: 0,
//                 scale: 0.7,
//               }}
//               whileInView={{
//                 opacity: 1,
//                 scale: 1,
//               }}
//               viewport={{
//                 once: true,
//               }}
//               transition={{
//                 delay: index * 0.15,
//               }}
//               className="text-center"
//             >
//               <h3
//                 className="
//     text-3xl
//     font-black
//     dark:text-white
//     "
//               >
//                 {item.value}
//               </h3>

//               <p className="text-gray-500">{item.label}</p>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       {/* Video Section */}

//       <section
//         className="
//     py-20
//     bg-white
//     dark:bg-gray-950
//     "
//       >
//         <div
//           className="
//     w-full
//     px-6
//     "
//         >
//           <motion.div
//             initial={{
//               opacity: 0,
//               y: 30,
//             }}
//             whileInView={{
//               opacity: 1,
//               y: 0,
//             }}
//             viewport={{
//               once: true,
//             }}
//             className="
//     mb-10
//     text-center
//     max-w-7xl
//     mx-auto
//     "
//           >
//             <h2
//               className="
//     text-3xl
//     font-bold
//     text-gray-900
//     dark:text-white
//     "
//             >
//               Discover StyleHub
//             </h2>
//             <p className="mt-3 text-gray-500">
//               Learn about our platform, AI-powered recommendations, and how we
//               connect you with the best fashion brands
//             </p>
//           </motion.div>

//           <div
//             className="
//     grid
//     grid-cols-1
//     md:grid-cols-2
//     gap-8
//     max-w-7xl
//     mx-auto
//     "
//           >
//             {/* Shop Video */}
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 y: 40,
//               }}
//               whileInView={{
//                 opacity: 1,
//                 y: 0,
//               }}
//               viewport={{
//                 once: true,
//               }}
//               transition={{
//                 delay: 0.2,
//               }}
//               className="
//     overflow-hidden
//     rounded-2xl
//     border
//     border-gray-100
//     bg-gray-50
//     dark:border-gray-800
//     dark:bg-gray-900
//     "
//             >
//               <div
//                 className="
//     aspect-video
//     w-full
//     bg-gradient-to-br
//     from-pink-100
//     to-purple-100
//     dark:from-pink-950
//     dark:to-purple-950
//     flex
//     items-center
//     justify-center
//     "
//               >
//                 <div className="text-center p-6">
//                   <div
//                     className="
//     mx-auto
//     mb-4
//     flex
//     h-16
//     w-16
//     items-center
//     justify-center
//     rounded-full
//     bg-white
//     shadow-lg
//     dark:bg-gray-800
//     "
//                   >
//                     <svg
//                       className="h-8 w-8 text-pink-500"
//                       fill="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path d="M8 5v14l11-7z" />
//                     </svg>
//                   </div>
//                   <h3
//                     className="
//     text-xl
//     font-semibold
//     text-gray-900
//         dark:text-white
//     "
//                   >
//                     How to Shop
//                   </h3>
//                   <p className="mt-2 text-sm text-gray-500">
//                     Browse thousands of products from independent brands
//                     worldwide
//                   </p>
//                 </div>
//               </div>
//               <div className="p-4">
//                 <h4
//                   className="
//     font-semibold
//     text-gray-900
//         dark:text-white
//     "
//                 >
//                   Shopping Experience
//                 </h4>
//                 <p className="mt-2 text-sm text-gray-500">
//                   Discover our curated collection of fashion items. Filter by
//                   category, price, style, and more. Add items to your wishlist
//                   or cart for easy checkout.
//                 </p>
//               </div>
//             </motion.div>

//             {/* AI Chart Video */}
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 y: 40,
//               }}
//               whileInView={{
//                 opacity: 1,
//                 y: 0,
//               }}
//               viewport={{
//                 once: true,
//               }}
//               transition={{
//                 delay: 0.4,
//               }}
//               className="
//     overflow-hidden
//     rounded-2xl
//     border
//     border-gray-100
//     bg-gray-50
//     dark:border-gray-800
//     dark:bg-gray-900
//     "
//             >
              
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* CTA */}

//       <section
//         className="
//     relative
//     overflow-hidden
//     bg-gray-950
//     py-28
//     text-white
//     "
//       >
//         <motion.div
//           animate={{
//             scale: [1, 1.2, 1],
//             opacity: [0.3, 0.7, 0.3],
//           }}
//           transition={{
//             duration: 8,
//             repeat: Infinity,
//           }}
//           className="absolut inset-0 bg-[radial-gradient(circle,_#374151,_transparent_60%)"
//         />

//         <motion.div
//           initial={{
//             opacity: 0,
//             y: 50,
//           }}
//           whileInView={{
//             opacity: 1,
//             y: 0,
//           }}
//           viewport={{
//             once: true,
//           }}
//           className="
//     relative
//     max-w-3xl
//     mx-auto
//     text-center
//     px-6
//     "
//         >
//           <h2
//             className="
//     text-5xl
//     font-black
//     "
//           >
//             Sell on StyleHub
//           </h2>

//           <p
//             className="
//     mt-5
//     text-gray-400
//     "
//           >
//             Join independent designers and boutiques reaching customers
//             worldwide.
//           </p>

//           <div className="mt-8">
//             <Button size="lg" asChild>
//               <Link to={ROUTES.REGISTER}>Start Selling</Link>
//             </Button>
//           </div>
//         </motion.div>
//       </section>
//     </div>
//   );
// }
