import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface UIState {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: (open?: boolean) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  wishlistProductIds: string[];
  toggleWishlist: (productId: string) => void;
}

const getInitialWishlist = (): string[] => {
  try {
    const raw = localStorage.getItem('stylehub_wishlist_items');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  
  showToast: (message, type = 'success', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, message, type, duration };
    
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  isMobileMenuOpen: false,
  toggleMobileMenu: (open) => set((state) => ({
    isMobileMenuOpen: open !== undefined ? open : !state.isMobileMenuOpen,
  })),

  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({
    isSidebarCollapsed: !state.isSidebarCollapsed,
  })),

  wishlistProductIds: getInitialWishlist(),
  toggleWishlist: (productId) => {
    const { wishlistProductIds } = get();
    const isSaved = wishlistProductIds.includes(productId);
    
    let updated: string[];
    if (isSaved) {
      updated = wishlistProductIds.filter((id) => id !== productId);
      get().showToast('Removed from wishlist', 'info');
    } else {
      updated = [...wishlistProductIds, productId];
      get().showToast('Added to wishlist', 'success');
    }
    
    localStorage.setItem('stylehub_wishlist_items', JSON.stringify(updated));
    set({ wishlistProductIds: updated });
  },
}));
