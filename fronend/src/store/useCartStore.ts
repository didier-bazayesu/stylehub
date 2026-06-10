import { create } from 'zustand';
import { CartItem, Product, ProductVariant, Coupon } from '../types';

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  addItem: (product: Product, variant: ProductVariant, quantity: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon | null) => void;
  getCartSubtotal: () => number;
  getDiscountAmount: () => number;
  getShippingCost: () => number;
  getCartTotal: () => number;
}

// Read initial cart items from localStorage safely
const getInitialCartItems = (): CartItem[] => {
  try {
    const raw = localStorage.getItem('stylehub_cart_items');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: getInitialCartItems(),
  coupon: null,

  addItem: (product, variant, quantity) => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.variant_id === variant.id);

    let updatedItems: CartItem[] = [];

    if (existingIndex > -1) {
      updatedItems = [...items];
      updatedItems[existingIndex].quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: `cit_${Math.random().toString(36).substring(2, 9)}`,
        cart_id: 'cart_default',
        product_id: product.id,
        product,
        variant_id: variant.id,
        variant,
        quantity,
      };
      updatedItems = [...items, newItem];
    }

    localStorage.setItem('stylehub_cart_items', JSON.stringify(updatedItems));
    set({ items: updatedItems });
  },

  updateQuantity: (variantId, quantity) => {
    const { items } = get();
    if (quantity <= 0) {
      get().removeItem(variantId);
      return;
    }

    const updatedItems = items.map((item) =>
      item.variant_id === variantId ? { ...item, quantity } : item
    );

    localStorage.setItem('stylehub_cart_items', JSON.stringify(updatedItems));
    set({ items: updatedItems });
  },

  removeItem: (variantId) => {
    const { items } = get();
    const updatedItems = items.filter((item) => item.variant_id !== variantId);

    localStorage.setItem('stylehub_cart_items', JSON.stringify(updatedItems));
    set({ items: updatedItems });
  },

  clearCart: () => {
    localStorage.removeItem('stylehub_cart_items');
    set({ items: [], coupon: null });
  },

  applyCoupon: (coupon) => {
    set({ coupon });
  },

  getCartSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => {
      // Use variant price if available, otherwise fallback to base_price
      const price = Number(item.variant.price) || Number(item.product.base_price);
      return sum + price * item.quantity;
    }, 0);
  },

  getDiscountAmount: () => {
    const { coupon } = get();
    if (!coupon) return 0;

    const subtotal = get().getCartSubtotal();
    if (coupon.min_order && subtotal < coupon.min_order) return 0;

    if (coupon.discount_type === 'percentage') {
      return (subtotal * coupon.discount_value) / 100;
    } else {
      return Math.min(subtotal, coupon.discount_value);
    }
  },

  getShippingCost: () => {
    const subtotal = get().getCartSubtotal();
    if (subtotal === 0) return 0;
    return subtotal > 150 ? 0 : 15; // Free shipping over $150
  },

  getCartTotal: () => {
    const subtotal = get().getCartSubtotal();
    const discount = get().getDiscountAmount();
    const shipping = get().getShippingCost();
    return Math.max(0, subtotal + shipping - discount);
  },
}));
