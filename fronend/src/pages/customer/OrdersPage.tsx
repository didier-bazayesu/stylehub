/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useOrders } from '../../api/hooks';
import { Order } from '../../types';
import { Button, Loading, Card, CardBody, Dialog, Badge } from '../../components/ui';
import { OrderCard } from '../../components/shared/cards';
import { Navbar, Footer, PageWrapper, CustomerSidebar } from '../../components/shared/layout';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { getOrderStatusColor } from '../../lib/helpers';
import { BookOpen, Calendar, Mail, FileText, CheckCircle } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const OrdersPage: React.FC = () => {
  const { data: orders, isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const showToast = useUIStore((s) => s.showToast);

  const handleDownloadInvoice = (order: Order) => {
    // Mock downloading invoice file
    showToast(`Invoice_${order.id}.pdf compiled & downloaded successfully!`, 'success');
  };

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <CustomerSidebar />

        {/* Outer orders list desk */}
        <div className="flex-1 space-y-6" id="buyer-orders-history">
          <div className="border-b border-neutral-100 pb-4 flex justify-between items-end">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Your Orders History</h1>
            <span className="text-xs font-mono font-bold text-neutral-450 uppercase">{orders?.length || 0} Invoice entries found</span>
          </div>

          {isLoading ? (
            <Loading text="Scanning vintage ledger files..." />
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-16 border rounded-xl border-dashed bg-white text-neutral-400 text-xs">
              You have not registered any apparel orders yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6" id="orders-deck">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} onDetailClick={(ord) => setSelectedOrder(ord)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL DRAWER */}
      {selectedOrder && (
        <Dialog
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Ledger: ${selectedOrder.id}`}
        >
          <div className="space-y-6 text-xs" id="invoice-modal-content">
            {/* Status overview */}
            <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-25 flex justify-between items-center">
              <div>
                <p className="font-semibold text-neutral-500">Order status</p>
                <Badge variant="outline" className={`mt-1 font-bold ${getOrderStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-500">Invoice date</p>
                <p className="font-bold text-neutral-805 mt-1">{formatDate(selectedOrder.created_at)}</p>
              </div>
            </div>

            {/* Address specifications */}
            <div className="space-y-1.5 leading-normal p-3 border rounded-xl">
              <p className="font-bold text-neutral-800">Recipients Logistics</p>
              <p className="text-neutral-500 font-medium">{selectedOrder.address?.full_name} • {selectedOrder.address?.phone}</p>
              <p className="text-neutral-600 font-semibold">{selectedOrder.address?.line1}, {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.postal_code}</p>
            </div>

            {/* List Ordered Items */}
            <div className="space-y-3">
              <span className="font-bold text-neutral-500 font-mono block">Garment Specifications</span>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center py-2 border-b border-dashed border-neutral-100">
                  <img
                    src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=150&fit=crop'}
                    className="w-10 h-14 rounded object-cover border"
                    alt={item.product?.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">{item.product?.name}</p>
                    <p className="text-[10px] text-neutral-450 mt-0.5">Size: {item.variant?.size} | Color: {item.variant?.color}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-800">{item.quantity} x {formatCurrency(item.unit_price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown costs */}
            <div className="space-y-1.5 text-right font-semibold text-neutral-600 pt-2 border-t border-neutral-100">
              <p>Invoice Subtotal: <span className="font-bold text-neutral-800">{formatCurrency(selectedOrder.subtotal)}</span></p>
              {selectedOrder.discount_amount > 0 && <p className="text-emerald-700">Applied Coupon: <span className="font-black">-{formatCurrency(selectedOrder.discount_amount)}</span></p>}
              <p>Delivery Shipping: <span className="font-bold text-neutral-800">{formatCurrency(selectedOrder.shipping_cost)}</span></p>
              <p className="text-md text-neutral-900 pt-2 font-black border-t">Final Grand Total: {formatCurrency(selectedOrder.total)}</p>
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t">
              <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(selectedOrder)} className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Export Ledger PDF
              </Button>
              <Button size="sm" onClick={() => setSelectedOrder(null)}>
                Acknowledge
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      <Footer />
    </PageWrapper>
  );
};
export default OrdersPage;
