/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../client';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { 
  Product, Category, Order, Address, Coupon, Review, 
  Notification, AuditLog, User, Vendor, Store
} from '../../types';

// --- Auth Mutations ---
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (credentials: any) => {
      const response = await client.post<any>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token, data.vendor, data.store);
      showToast(`Welcome back, ${data.user.first_name}!`, 'success');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Login failed';
      showToast(msg, 'error');
    },
  });
}

export function useRegisterMutation() {
  const showToast = useUIStore((s) => s.showToast);
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await client.post<any>('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      showToast('Account created successfully!', 'success');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Registration failed';
      showToast(msg, 'error');
    },
  });
}

// --- Categories ---
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await client.get<Category[]>('/categories');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// --- Products ---
export function useProducts(filters: any = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await client.get<Product[]>('/products');
      let data = response.data;
      
      // Filter mockup on front-end for responsiveness
      if (filters.search) {
        const query = filters.search.toLowerCase();
        data = data.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
      }
      if (filters.category && filters.category !== 'all') {
        data = data.filter(p => p.category_id === filters.category);
      }
      if (filters.minPrice) {
        data = data.filter(p => p.base_price >= Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        data = data.filter(p => p.base_price <= Number(filters.maxPrice));
      }
      if (filters.sort) {
        if (filters.sort === 'price-low-high') {
          data = [...data].sort((a,b) => a.base_price - b.base_price);
        } else if (filters.sort === 'price-high-low') {
          data = [...data].sort((a,b) => b.base_price - a.base_price);
        } else if (filters.sort === 'rating') {
          data = [...data].sort((a,b) => b.avg_rating - a.avg_rating);
        }
      }
      
      return data;
    },
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const response = await client.get<Product[]>('/products/featured');
      return response.data;
    },
  });
}

export function useProductDetail(slug: string) {
  return useQuery({
    queryKey: ['products', slug],
    queryFn: async () => {
      const response = await client.get<Product>(`/products/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (productData: any) => {
      const response = await client.post<Product>('/products', productData);
      return response.data;
    },
    onSuccess: () => {
      showToast('Product uploaded successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await client.patch<Product>(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Product updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/products/${id}`);
    },
    onSuccess: () => {
      showToast('Product deleted from active catalog', 'info');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// --- Stores ---
export function useStoreDetail(slug: string) {
  return useQuery({
    queryKey: ['stores', slug],
    queryFn: async () => {
      const response = await client.get<Store>(`/stores/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });
}

export function useStoreProducts(slug: string) {
  return useQuery({
    queryKey: ['stores', slug, 'products'],
    queryFn: async () => {
      const response = await client.get<Product[]>(`/stores/${slug}/products`);
      return response.data;
    },
    enabled: !!slug,
  });
}

// --- Orders ---
export function useCustomerOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await client.get<Order[]>('/orders');
      return response.data;
    },
  });
}

export function useVendorOrders() {
  return useQuery({
    queryKey: ['orders', 'vendor'],
    queryFn: async () => {
      const response = await client.get<Order[]>('/orders/vendor');
      return response.data;
    },
  });
}

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = await client.get<Order>(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (orderData: any) => {
      const response = await client.post<Order>('/orders', orderData);
      return response.data;
    },
    onSuccess: (data) => {
      showToast(`Order created successfully! Code: ${data.id}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await client.patch<Order>(`/orders/${id}`, { status });
      return response.data;
    },
    onSuccess: (data) => {
      showToast(`Order status updated to ${data.status}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// --- Addresses ---
export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await client.get<Address[]>('/addresses');
      return response.data;
    },
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await client.post<Address>('/addresses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await client.patch<Address>(`/addresses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

// --- Notifications ---
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await client.get<Notification[]>('/notifications');
      return response.data;
    },
  });
}

// --- Vendors (Apply) ---
export function useApplyVendorMutation() {
  const showToast = useUIStore((s) => s.showToast);
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await client.post<any>('/vendors/apply', data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Vendor application submitted successfully!', 'success');
    },
  });
}

export function useVendorStats() {
  return useQuery({
    queryKey: ['vendor', 'me', 'stats'],
    queryFn: async () => {
      const response = await client.get<any>('/vendors/me/stats');
      return response.data;
    },
  });
}

// --- Admin (Platform Management) ---
export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await client.get<User[]>('/admin/users');
      return response.data;
    },
  });
}

export function useAdminVendors() {
  return useQuery({
    queryKey: ['admin', 'vendors'],
    queryFn: async () => {
      const response = await client.get<Vendor[]>('/admin/vendors');
      return response.data;
    },
  });
}

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: async () => {
      const response = await client.get<AuditLog[]>('/admin/audit-logs');
      return response.data;
    },
  });
}

export function useAdminApproveVendorMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.patch<any>(`/admin/vendors/${id}/approve`, {});
      return response.data;
    },
    onSuccess: () => {
      showToast('Vendor approved successfully and store is live!', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
    },
  });
}

export function useAdminRejectVendorMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await client.patch<any>(`/admin/vendors/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      showToast('Vendor application declined', 'info');
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
    },
  });
}

export function useAdminDeactivateUserMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const response = await client.patch<any>(`/admin/users/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (data) => {
      showToast(`User account ${data.is_active ? 'activated' : 'deactivated'}`, 'info');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const response = await client.get<Coupon[]>('/admin/coupons');
      return response.data;
    },
  });
}

export function useAdminCreateCouponMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await client.post<Coupon>('/admin/coupons', data);
      return response.data;
    },
    onSuccess: () => {
      showToast('New coupon code created!', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}

export function useAdminDeleteCouponMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/coupons/${id}`);
    },
    onSuccess: () => {
      showToast('Coupon deleted', 'info');
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
}

// Backward compatible aliases
export const useVendors = useAdminVendors;
export const useUsers = useAdminUsers;
export const useAuditLogs = useAdminAuditLogs;
export const useOrders = useCustomerOrders;

