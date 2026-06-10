/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetail } from '../../api/hooks';
import { useCartStore } from '../../store/useCartStore';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Button, Loading, Badge } from '../../components/ui';
import { Navbar, Footer, PageWrapper } from '../../components/shared/layout';
import { Star, Shield, HelpCircle, Heart, Share2, Compass, AlertCircle, ShoppingCart } from 'lucide-react';
import { ROUTES } from '../../config/routes';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProductDetail(slug || '');
  
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useUIStore((s) => s.toggleWishlist);
  const wishlistProductIds = useUIStore((s) => s.wishlistProductIds);
  const showToast = useUIStore((s) => s.showToast);

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedImageId, setSelectedImageId] = useState<string>('');

  if (isLoading) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="flex-1 flex justify-center py-20">
          <Loading text="Retrieving curation specifications..." />
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 py-20 text-center text-xs text-neutral-400">
          <AlertCircle className="w-10 h-10 mb-4 text-neutral-300" />
          <p>The sought heritage fashion curation is no longer available.</p>
          <Button onClick={() => navigate(ROUTES.PRODUCTS)} className="mt-4">Back to Catalog</Button>
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  // Variations variables initialization
  const variants = product.variants || [];
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];
  const images = product.images || [];
  const activeImage = images.find(img => img.id === selectedImageId)?.url || images.find(img => img.is_primary)?.url || images[0]?.url;
  
  const isWishlisted = wishlistProductIds.includes(product.id);
  const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.base_price);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, 1);
    showToast(`Added to cart: ${product.name} (${selectedVariant.size})`, 'success');
  };

  return (
    <PageWrapper>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10" id="product-detail-layout">
          
          {/* Photos Showcase Panel */}
          <div className="space-y-4" id="photos-gallery">
            <div className="aspect-[3/4] overflow-hidden bg-neutral-50 rounded-xl border border-neutral-150 relative">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs shadow hover:bg-white text-neutral-600 cursor-pointer"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
            
            {/* Thumbnails row */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageId(img.id)}
                    className={`w-16 h-20 overflow-hidden rounded-lg border cursor-pointer transition-all ${
                      activeImage === img.url ? 'border-neutral-900 ring-2 ring-neutral-950/10' : 'border-neutral-200'
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="alt" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Garments Infomations Card Panel */}
          <div className="flex flex-col gap-6" id="product-purchase-box">
            <div className="space-y-2.5 border-b border-neutral-100 pb-5">
              <div className="flex items-center gap-1.5 text-xs text-neutral-450 font-semibold font-mono">
                <Compass className="w-3.5 h-3.5 text-neutral-400" />
                <span>Boutique Partner: Studio Retro Threads</span>
              </div>
              <h1 className="text-2xl sm:text-3.5xl font-black text-neutral-950 tracking-tight leading-none">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex text-amber-400">★ ★ ★ ★ ★</div>
                <span className="font-bold text-neutral-600">{product.avg_rating.toFixed(1)}</span>
                <span className="text-neutral-450">({product.review_count} verified reviews)</span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Sourced Price</span>
                <span className="text-2.5xl font-black text-neutral-900">{formatCurrency(currentPrice)}</span>
              </div>
              <span className="text-xs text-neutral-500 font-mono">Free shipping over $150</span>
            </div>

            {/* Sizes & Variations selectors */}
            {variants.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-500 font-mono block">Available size curations</span>
                <div className="flex flex-wrap gap-2.5">
                  {variants.map((v) => {
                    const active = (selectedVariantId || variants[0].id) === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-4 py-2 border rounded-xl text-xs font-semibold select-none cursor-pointer transition-colors ${
                          active 
                            ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs' 
                            : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        Size {v.size} {v.color && `(${v.color})`} • Only {v.stock} left
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detailed Description */}
            <div className="space-y-1.5 text-xs text-neutral-600 leading-relaxed">
              <span className="text-xs font-bold text-neutral-500 font-mono block">Lineage Spec description</span>
              <p>{product.description}</p>
            </div>

            {/* Action CTA */}
            <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
              <Button size="lg" className="w-full h-12" onClick={handleAddToCart}>
                <ShoppingCart className="w-4 h-4 mr-2" /> Purchase Sourced Item
              </Button>
              <div className="flex items-center justify-center gap-6 mt-2 text-[10px] text-neutral-450 font-mono font-semibold" id="safeguard-indicators">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-600" /> HERITAGE RESTORATION</span>
                <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> SECURE STRIPE CHECKOUT</span>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS GRID SECTION */}
        <div className="mt-16 pt-10 border-t border-neutral-150" id="product-reviews-section">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight mb-6">Verified Collector Reviews ({product.review_count})</h2>
          
          {product.review_count === 0 ? (
            <p className="text-xs text-neutral-450">This archival piece has no physical customer review logged yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((reviewIdx) => (
                <div key={reviewIdx} className="p-5 border border-neutral-150 rounded-xl bg-white shadow-xs space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-neutral-700">Verified Buyer</span>
                    <span className="text-neutral-400">June 8, 2026</span>
                  </div>
                  <div className="flex text-amber-400 text-xs">★ ★ ★ ★ ★</div>
                  <p className="text-xs text-neutral-600 leading-relaxed italic">
                    "This is an incredibly rare piece. The stitching density and leather depth is beautiful. Authentic to its vintage label."
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </PageWrapper>
  );
};
export default ProductDetailPage;
