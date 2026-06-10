/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, Order, Category, Store, ProductStatus } from '../../../types';
import { formatCurrency, formatDate } from '../../../lib/formatters';
import { getOrderStatusColor } from '../../../lib/helpers';
import { ROUTES } from '../../../config/routes';
import { useCartStore } from '../../../store/useCartStore';
import { useUIStore } from '../../../store/useUIStore';
import { ShoppingCart, Heart, Star, Store as StoreIcon, Package, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, Button, Badge, Avatar } from '../../ui';

// ==========================================
// 1. PRODUCT CARD
// ==========================================
export interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useUIStore((s) => s.toggleWishlist);
  const wishlistProductIds = useUIStore((s) => s.wishlistProductIds);
  
  const isWishlisted = wishlistProductIds.includes(product.id);
  const primaryImage = product.images.find(img => img.is_primary)?.url || product.images[0]?.url;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants.length > 0) {
      addItem(product, product.variants[0], 1);
      useUIStore.getState().showToast(`${product.name} (Size ${product.variants[0].size}) added to cart`, 'success');
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div 
      onClick={() => navigate(ROUTES.PRODUCT_DETAIL.replace(':slug', product.slug))}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white hover:shadow-md cursor-pointer transition-all duration-300"
      id={`product-card-${product.id}`}
    >
      {/* Product Image Stage */}
      <div className="aspect-[3/4] overflow-hidden bg-neutral-100 relative">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
        />

        {/* Quick actions overlays */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs shadow-xs hover:bg-white text-neutral-600 transition-colors cursor-pointer"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {product.is_featured && (
          <span className="absolute top-3 left-3 bg-neutral-900 text-white font-mono text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-sm uppercase">Curated</span>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
          <StoreIcon className="w-3.5 h-3.5" />
          <span>Retro Threads</span>
        </div>
        
        <h3 className="font-bold text-sm text-neutral-900 group-hover:text-black line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Ratings & Total Orders */}
        <div className="flex items-center gap-1 mt-0.5 text-xs text-neutral-600">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{product.avg_rating.toFixed(1)}</span>
          <span className="text-neutral-400">({product.review_count})</span>
        </div>

        {/* Price & Cart CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-sm font-black text-neutral-900">{formatCurrency(product.base_price)}</span>
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer focus:outline-none"
            title="Quick add to basket"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. ORDER CARD
// ==========================================
export interface OrderCardProps {
  order: Order;
  onDetailClick?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onDetailClick }) => {
  return (
    <Card className="hover:shadow-xs transition-shadow" id={`order-card-${order.id}`}>
      <div className="p-5 flex flex-col md:flex-row justify-between gap-4 border-b border-neutral-100 bg-neutral-25">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-neutral-500">ID: {order.id}</span>
            <Badge variant="outline" className={getOrderStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
          <span className="text-xs text-neutral-400">Purchased on {formatDate(order.created_at)}</span>
        </div>
        <div className="text-right flex flex-col gap-1 md:items-end">
          <span className="text-xs font-medium text-neutral-500">Invoice Total</span>
          <span className="text-md font-black text-neutral-900">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex gap-4 items-center py-1">
            <img
              src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=150&h=150&fit=crop'}
              alt={item.product?.name}
              className="w-12 h-16 rounded object-cover border border-neutral-100 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-neutral-800 line-clamp-1">{item.product?.name}</h4>
              <p className="text-[11px] text-neutral-400">Size: {item.variant?.size} | Colour: {item.variant?.color}</p>
              <p className="text-xs font-semibold text-neutral-600 mt-0.5">{item.quantity} x {formatCurrency(item.unit_price)}</p>
            </div>
          </div>
        ))}
        
        {onDetailClick && (
          <div className="flex justify-end pt-3 border-t border-neutral-100">
            <Button size="sm" variant="outline" onClick={() => onDetailClick(order)}>
              View Order Details
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// ==========================================
// 3. STATS CARD
// ==========================================
export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: 'revenue' | 'orders' | 'products' | 'customers';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, isPositive = true, icon = 'revenue' }) => {
  const iconMap = {
    revenue: <DollarSign className="w-5 h-5 text-emerald-600" />,
    orders: <Package className="w-5 h-5 text-blue-600" />,
    products: <ShoppingCart className="w-5 h-5 text-purple-600" />,
    customers: <Users className="w-5 h-5 text-indigo-600" />,
  };

  const bgMap = {
    revenue: 'bg-emerald-50 border-emerald-100',
    orders: 'bg-blue-50 border-blue-100',
    products: 'bg-purple-50 border-purple-100',
    customers: 'bg-indigo-50 border-indigo-100',
  };

  return (
    <Card className="flex items-center justify-between p-5" id={`stats-card-${title.toLowerCase().replace(/ /g, '-')}`}>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">{title}</span>
        <span className="text-2xl font-black text-neutral-900 tracking-tight">{value}</span>
        {change && (
          <span className={`text-xs font-bold flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? '▲' : '▼'} {change} <span className="text-neutral-450 font-normal">vs last month</span>
          </span>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${bgMap[icon]}`}>
        {iconMap[icon]}
      </div>
    </Card>
  );
};

// ==========================================
// 4. VENDOR CARD
// ==========================================
export interface VendorCardProps {
  store: Store;
}

export const VendorCard: React.FC<VendorCardProps> = ({ store }) => {
  return (
    <Card className="hover:shadow-md transition-all h-full flex flex-col justify-between" id={`vendor-store-card-${store.id}`}>
      <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-100">
        <img
          src={store.banner_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=500&fit=crop'}
          alt={store.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <Avatar fallback={store.name} src={store.logo_url} size="md" />
          <div>
            <h4 className="font-extrabold text-neutral-900 text-md leading-tight">{store.name}</h4>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Verified Partner</span>
          </div>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 mb-4">{store.description || 'Boutique collection curation'}</p>
        <Link to={ROUTES.STORE_DETAIL.replace(':slug', store.slug)} className="mt-auto">
          <Button size="sm" variant="outline" className="w-full">
            Enter Boutique
          </Button>
        </Link>
      </div>
    </Card>
  );
};

// ==========================================
// 5. CATEGORY CARD
// ==========================================
export interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link 
      to={`${ROUTES.PRODUCTS}?category=${category.id}`}
      className="group relative h-40 rounded-xl overflow-hidden border border-neutral-150 block shadow-xs hover:border-neutral-900/40 transition-all duration-300"
      id={`category-card-${category.id}`}
    >
      <img
        src={category.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&fit=crop'}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 brightness-90 group-hover:brightness-85"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white flex flex-col gap-0.5">
        <span className="text-sm font-black tracking-tight">{category.name}</span>
        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-300 font-semibold">Shop Boutique</span>
      </div>
    </Link>
  );
};
