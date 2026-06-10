/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency } from '../../lib/formatters';
import { Button, Card, CardBody, Badge, EmptyState, Input } from '../../components/ui';
import { Navbar, Footer, PageWrapper } from '../../components/shared/layout';
import { Trash2, ArrowRight, ShieldCheck, Tag, ShoppingCart, Percent } from 'lucide-react';
import { ROUTES } from '../../config/routes';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const showToast = useUIStore((s) => s.showToast);
  
  const { 
    items, coupon, updateQuantity, removeItem, clearCart, applyCoupon,
    getCartSubtotal, getDiscountAmount, getShippingCost, getCartTotal 
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    // Simulate coupon check
    const code = couponCode.toUpperCase().trim();
    if (code === 'WELCOME10') {
      applyCoupon({
        id: 'cp_welcome10',
        code: 'WELCOME10',
        discount_type: 'percentage',
        discount_value: 10,
        min_order: 50,
        uses_count: 1,
        is_active: true
      });
      showToast('10% Coupon applied successfully!', 'success');
    } else if (code === 'RETRO50') {
      const subtotal = getCartSubtotal();
      if (subtotal < 200) {
        showToast('Min order for RETRO50 is $200.00', 'warning');
        return;
      }
      applyCoupon({
        id: 'cp_retro50',
        code: 'RETRO50',
        discount_type: 'fixed',
        discount_value: 50,
        min_order: 200,
        uses_count: 1,
        is_active: true
      });
      showToast('$50.00 Fixed discount applied!', 'success');
    } else {
      showToast('Invalid coupon code. Try WELCOME10', 'error');
    }
  };

  if (items.length === 0) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 flex-1 flex flex-col justify-center">
          <EmptyState
            title="Your style basket is empty"
            description="Explore our design catalog to discover heavyweight vintage leather, denim and heritage garments curated by expert shops."
            actionLabel="Browse Catalog"
            onAction={() => navigate(ROUTES.PRODUCTS)}
            icon={<ShoppingCart className="w-12 h-12 text-neutral-300" />}
          />
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="flex flex-col gap-6" id="cart-screen">
          <div className="border-b border-neutral-100 pb-4">
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Shopping Basket</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Basket Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const primaryImage = item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&fit=crop';
                const price = Number(item.variant?.price) || Number(item.product?.base_price);
                
                return (
                  <Card key={item.variant_id} className="p-4 flex gap-4 items-center">
                    <img
                      src={primaryImage}
                      alt={item.product?.name}
                      className="w-16 h-20 object-cover rounded-lg border border-neutral-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <Link to={ROUTES.PRODUCT_DETAIL.replace(':slug', item.product?.slug)} className="font-bold text-neutral-850 hover:underline line-clamp-1">
                        {item.product?.name}
                      </Link>
                      <p className="text-xs text-neutral-400 mt-0.5">Size: {item.variant?.size} | Colour: {item.variant?.color}</p>
                      <span className="text-xs font-bold text-neutral-900 mt-1 block">{formatCurrency(price)}</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="w-8 h-8 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold select-none cursor-pointer focus:outline-none"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold font-mono w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        className="w-8 h-8 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold select-none cursor-pointer focus:outline-none"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete item */}
                    <button
                      onClick={() => removeItem(item.variant_id)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-25 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Card>
                );
              })}

              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-rose-600 font-bold hover:bg-rose-25">
                  Clear entire cart
                </Button>
                <Link to={ROUTES.PRODUCTS} className="text-xs font-bold text-neutral-800 hover:underline">
                  ➔ Continue Shopping
                </Link>
              </div>
            </div>

            {/* Calculations summaries card */}
            <div className="space-y-6">
              <Card className="p-5 border-neutral-100 shadow-md">
                <h3 className="font-bold text-neutral-900 text-md border-b border-neutral-100 pb-3 mb-4">Summary Specifications</h3>
                
                <div className="space-y-3 text-xs text-neutral-600 border-b border-neutral-100 pb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-800">{formatCurrency(getCartSubtotal())}</span>
                  </div>

                  {coupon && (
                    <div className="flex justify-between text-emerald-700 bg-emerald-25 p-2 rounded-lg border border-emerald-100">
                      <span className="flex items-center gap-1 font-semibold">
                        <Percent className="w-3.5 h-3.5" /> Code: {coupon.code}
                      </span>
                      <span className="font-bold">-{formatCurrency(getDiscountAmount())}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-neutral-800">
                      {getShippingCost() === 0 ? <Badge variant="success">FREE</Badge> : formatCurrency(getShippingCost())}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end py-4 mb-4">
                  <span className="text-sm font-bold text-neutral-850">Grand Order Total</span>
                  <span className="text-xl font-black text-neutral-900">{formatCurrency(getCartTotal())}</span>
                </div>

                {/* Coupon submission input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-5">
                  <Input
                    placeholder="PROMOCAMP"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    wrapperClassName="flex-1"
                  />
                  <Button type="submit" size="sm" variant="outline" className="h-10 mt-auto">Apply</Button>
                </form>

                <Button size="lg" className="w-full h-12" onClick={() => navigate(ROUTES.CHECKOUT)}>
                  Secure Checkout <ArrowRight className="w-4.5 h-4.5 ml-2" />
                </Button>
              </Card>

              <div className="p-4 rounded-xl border bg-neutral-25 flex gap-3 text-xs text-neutral-500 leading-normal" id="checkout-safeguard">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-neutral-800">Secure Style Transactions</p>
                  <p>Checkouts are protected by Stripe standard escrow security. Sourced apparel catalog is certified prior to deployment.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </PageWrapper>
  );
};
export default CartPage;
