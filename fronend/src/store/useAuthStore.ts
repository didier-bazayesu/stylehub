/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { User, Role, Vendor, Store, VendorStatus } from '../types';

interface AuthState {
  user: User | null;
  vendor: Vendor | null;
  store: Store | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null, token: string | null, vendor?: Vendor | null, store?: Store | null) => void;
  updateUser: (fields: Partial<User>) => void;
  updateVendor: (fields: Partial<Vendor>) => void;
  updateStore: (fields: Partial<Store>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

// Pre-seeded local data for the demo so users can easily test
export const MOCK_CUSTOMER: User = {
  id: 'usr_customer',
  email: 'customer@stylehub.com',
  first_name: 'Jessica',
  last_name: 'Miller',
  phone: '+1 (555) 732-8491',
  role: 'CUSTOMER',
  is_verified: true,
  is_active: true,
  created_at: new Date().toISOString(),
};

export const MOCK_VENDOR_USER: User = {
  id: 'usr_vendor',
  email: 'vendor@stylehub.com',
  first_name: 'Marcos',
  last_name: 'Chen',
  phone: '+1 (555) 912-3456',
  role: 'VENDOR',
  is_verified: true,
  is_active: true,
  created_at: new Date().toISOString(),
};

export const MOCK_VENDOR: Vendor = {
  id: 'vnd_retro_threads',
  user_id: 'usr_vendor',
  status: 'APPROVED',
  business_name: 'Studio Retro Threads',
  business_email: 'retro.threads@stylehub.com',
  description: 'Handpicked curation of premium 90s vintage clothing, leather jackets, and streetwear.',
  created_at: new Date().toISOString(),
};

export const MOCK_STORE: Store = {
  id: 'str_retro_threads',
  vendor_id: 'vnd_retro_threads',
  name: 'Retro Threads',
  slug: 'retro-threads',
  logo_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200&h=200&fit=crop',
  banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&h=400&fit=crop',
  description: 'Curating the finest genuine vintage streetwear garments to elevate your daily style statement.',
  is_active: true,
  created_at: new Date().toISOString(),
};

export const MOCK_ADMIN_USER: User = {
  id: 'usr_admin',
  email: 'admin@stylehub.com',
  first_name: 'Arthur',
  last_name: 'Pendragon',
  role: 'ADMIN',
  is_verified: true,
  is_active: true,
  created_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  vendor: null,
  store: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user, token, vendor = null, store = null) => set({
    user,
    token,
    vendor,
    store,
    isAuthenticated: !!user,
    isLoading: false,
  }),

  updateUser: (fields) => set((state) => ({
    user: state.user ? { ...state.user, ...fields } : null,
  })),

  updateVendor: (fields) => set((state) => ({
    vendor: state.vendor ? { ...state.vendor, ...fields } : null,
  })),

  updateStore: (fields) => set((state) => ({
    store: state.store ? { ...state.store, ...fields } : null,
  })),

  logout: () => set({
    user: null,
    vendor: null,
    store: null,
    token: null,
    isAuthenticated: false,
  }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
