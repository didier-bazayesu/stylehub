import { OrderStatus, PaymentStatus, VendorStatus } from '../types';

export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'CONFIRMED':
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SHIPPED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'REFUNDED':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'FAILED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'REFUNDED':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getVendorStatusColor(status: VendorStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'SUSPENDED':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function calculateOrderTotals(
  subtotal: number,
  shippingCost: number,
  discount: number
) {
  const total = Math.max(0, subtotal + shippingCost - discount);
  return {
    subtotal,
    shippingCost,
    discount,
    total,
  };
}
