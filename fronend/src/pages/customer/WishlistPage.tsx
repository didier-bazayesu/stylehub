/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useProducts } from '../../api/hooks';
import { ProductCard } from '../../components/shared/cards';
import { Loading } from '../../components/ui';
import { Navbar, Footer, PageWrapper, CustomerSidebar } from '../../components/shared/layout';
import { Heart } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const wishlistProductIds = useUIStore((s) => s.wishlistProductIds);
  const { data: products, isLoading } = useProducts();

  // Filter products by wishlisted IDs
  const wishlistedProducts = products?.filter((p) => wishlistProductIds.includes(p.id)) || [];

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <CustomerSidebar />

        <div className="flex-1 space-y-6" id="buyer-wishlist-deck">
          <div className="border-b border-neutral-100 pb-4">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> Sourced Wishlist
            </h1>
          </div>

          {isLoading ? (
            <Loading text="Scanning saved garments inventories..." />
          ) : wishlistedProducts.length === 0 ? (
            <div className="text-center py-16 border rounded-xl border-dashed bg-white text-neutral-400 text-xs">
              Your wishlist folder is empty. Browse the boutique garments catalog to save pieces.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="wishlist-products-grid">
              {wishlistedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default WishlistPage;
