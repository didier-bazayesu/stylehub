/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, MOCK_CUSTOMER, MOCK_VENDOR_USER, MOCK_VENDOR, MOCK_STORE, MOCK_ADMIN_USER } from '../../store/useAuthStore';
import { useFeaturedProducts, useProducts, useCategories } from '../../api/hooks';
import { ProductCard, CategoryCard } from '../../components/shared/cards';
import { Button, Loading, Badge } from '../../components/ui';
import { Navbar, Footer, PageWrapper } from '../../components/shared/layout';
import { Sparkles, ArrowRight, ShieldCheck, Store, User as UserIcon, Heart, Send } from 'lucide-react';
import { ROUTES } from '../../config/routes';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  
  const { data: featuredProds, isLoading: fpLoading } = useFeaturedProducts();
  const { data: categories, isLoading: catLoading } = useCategories();
  
  const handleQuickLogin = (role: 'customer' | 'vendor' | 'admin') => {
    if (role === 'customer') {
      setAuth(MOCK_CUSTOMER, 'dummy_token');
      navigate(ROUTES.HOME);
    } else if (role === 'vendor') {
      setAuth(MOCK_VENDOR_USER, 'dummy_token', MOCK_VENDOR, MOCK_STORE);
      navigate(ROUTES.VENDOR_DASHBOARD);
    } else if (role === 'admin') {
      setAuth(MOCK_ADMIN_USER, 'dummy_token');
      navigate(ROUTES.ADMIN_DASHBOARD);
    }
  };

  return (
    <PageWrapper>
      <Navbar />

      {/* DEMO PROFILE QUICK LOGINS BAR */}
      <section className="bg-neutral-900 border-b border-neutral-800 text-white py-3 px-4" id="quick-roles-shortcuts">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="text-[10px] animate-pulse">Platform Demo Control</Badge>
            <span className="font-semibold text-neutral-300">Test roles dashboard instantly:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickLogin('customer')}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
            >
              <UserIcon className="w-3.5 h-3.5" /> Jessica (Buyer)
            </button>
            <button
              onClick={() => handleQuickLogin('vendor')}
              className="px-3 py-1.5 rounded bg-amber-900 hover:bg-amber-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
            >
              <Store className="w-3.5 h-3.5 text-amber-300" /> Retro Threads (Vendor)
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="px-3 py-1.5 rounded bg-emerald-900 hover:bg-emerald-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Arthur (Admin)
            </button>
          </div>
        </div>
      </section>

      {/* HERO SECTION */}
      <section className="relative bg-neutral-50 py-20 overflow-hidden" id="hero-banner">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-neutral-400 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-neutral-400 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-6 text-center items-center">
          <div className="font-mono text-[10px] bg-neutral-200/60 px-3 py-1 rounded-full text-neutral-850 font-bold tracking-widest uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 animate-spin" /> heritage style marketplace
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-sans font-black text-neutral-900 tracking-tight max-w-4xl leading-[1.05]">
            Handpicked Vintage apparel curated for your unique expression
          </h1>

          <p className="text-sm sm:text-md text-neutral-550 max-w-xl leading-relaxed">
            Discover heavyweight leather bomber jackets, faded denim trucker jackets, and archival heritage items sourced by master design vintage collectors.
          </p>

          <div className="flex items-center gap-4 mt-4">
            <Button size="lg" onClick={() => navigate(ROUTES.PRODUCTS)}>
              Explore Curations <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => handleQuickLogin('vendor')}>
              Sell on StyleHub
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="categories-catalog">
        <div className="flex flex-col gap-1.5 mb-10 text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Bespoke Curation</span>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Featured Categories</h2>
        </div>

        {catLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories?.filter(c => c.image_url)?.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* NEW ARRIVALS FEEDS Section */}
      <section className="bg-neutral-50/60 py-16" id="featured-products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between border-b border-neutral-100 pb-4 mb-10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Authentic Garments</span>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Newly Sourced Garments</h2>
            </div>
            <Link to={ROUTES.PRODUCTS} className="text-xs font-bold text-neutral-800 hover:text-black flex items-center gap-1.5">
              View Catalog ➔
            </Link>
          </div>

          {fpLoading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProds?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="testimonials">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="space-y-4">
            <Badge variant="secondary" className="font-mono text-[9px] uppercase tracking-wider">True Curation</Badge>
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight leading-tight">Hear from our style community</h2>
            <p className="text-xs text-neutral-550 leading-relaxed max-w-sm">
              We connect design boutiques committed to preserving textile lineage with styling advocates seeking beautiful, enduring leather and denim.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-neutral-150 bg-white shadow-xs">
              <div className="flex items-center gap-1 text-amber-400 mb-3">▲ ★ ★ ★ ★ ★</div>
              <p className="text-xs text-neutral-600 leading-relaxed italic mb-4">
                "The 90s Leather Bomber arrived perfectly broken in. Authentic cowhide jacket with premium heavy brass zip detail. Best curation catalog I have shopped."
              </p>
              <div className="font-semibold text-xs text-neutral-800">— Taylor S., Brooklyn NY</div>
            </div>

            <div className="p-6 rounded-xl border border-neutral-150 bg-white shadow-xs">
              <div className="flex items-center gap-1 text-amber-400 mb-3">▲ ★ ★ ★ ★ ★</div>
              <p className="text-xs text-neutral-600 leading-relaxed italic mb-4">
                "Finding USA-made vintage Levi\'s 501s with genuine whisker distress on hips is so hard. StyleHub curators make sourcing archival denim effortless."
              </p>
              <div className="font-semibold text-xs text-neutral-800">— Marcus V., Austin TX</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </PageWrapper>
  );
};
export default HomePage;
