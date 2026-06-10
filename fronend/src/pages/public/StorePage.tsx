/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoreDetail, useStoreProducts } from '../../api/hooks';
import { ProductCard } from '../../components/shared/cards';
import { Loading, Avatar, Badge, Button } from '../../components/ui';
import { Navbar, Footer, PageWrapper } from '../../components/shared/layout';
import { Compass, Store, ArrowLeft, AlertCircle } from 'lucide-react';
import { ROUTES } from '../../config/routes';

export const StorePage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: store, isLoading: storeLoading } = useStoreDetail(slug || '');
  const { data: products, isLoading: productsLoading } = useStoreProducts(slug || '');

  if (storeLoading || productsLoading) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="flex-1 flex justify-center py-20">
          <Loading text="Entering boutique workspace..." />
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  if (!store) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 py-20 text-center text-xs text-neutral-400">
          <AlertCircle className="w-10 h-10 mb-4 text-neutral-300" />
          <p>The boutique store you are attempting to visit does not exist.</p>
          <Button onClick={() => navigate(ROUTES.HOME)} className="mt-4">Back to Marketplace</Button>
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar />

      {/* BOUTIQUE HERO BANNER */}
      <section className="relative aspect-[21/9] w-full bg-neutral-100 overflow-hidden border-b border-neutral-154" id="boutique-banner">
        <img
          src={store.banner_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&fit=crop'}
          alt={store.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <Avatar fallback={store.name} src={store.logo_url} size="lg" className="border-2 border-white/40" />
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight">{store.name}</h1>
                <p className="text-xs text-neutral-200 mt-1 line-clamp-2 max-w-xl">{store.description}</p>
              </div>
            </div>
            <div className="flex shrink-0">
              <Badge variant="success" className="text-xs font-mono font-extrabold uppercase py-1 border-white/20">Active Boutique Seller</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS COLLECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="flex flex-col gap-6" id="boutique-showcase">
          <div className="border-b border-neutral-100 pb-4 flex justify-between items-end">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-neutral-805" /> Sourced items collection
            </h2>
            <span className="text-xs font-mono font-bold text-neutral-450 uppercase">{products?.length || 0} Pieces stocked</span>
          </div>

          {products?.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-xl text-neutral-400 text-xs">
              This boutique has not listed any active garments yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="boutique-products-grid">
              {products?.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </PageWrapper>
  );
};
export default StorePage;
