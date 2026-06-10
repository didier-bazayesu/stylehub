/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useVendorOrders } from '../../api/hooks';
import { OrderStatus } from '../../types';
import { Card, CardBody, Loading } from '../../components/ui';
import { OrderTable } from '../../components/vendor/OrderTable';
import { Navbar, Footer, PageWrapper, VendorSidebar } from '../../components/shared/layout';
import { useUIStore } from '../../store/useUIStore';

export const OrdersPage: React.FC = () => {
  const { data: orders, isLoading, refetch } = useVendorOrders();
  const showToast = useUIStore((s) => s.showToast);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    // In our client, we can simulate updating order states easily!
    showToast(`Order status updated to ${newStatus}`, 'success');
  };

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <VendorSidebar />

        <div className="flex-1 space-y-6" id="merchant-orders-invoices">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono">Customer sales logistics</span>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">Manage Boutique Orders</h1>
          </div>

          {isLoading ? (
            <Loading text="Scanning vintage sales ledger databases..." />
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-20 border rounded-xl border-dashed bg-white text-neutral-400 text-xs">
              No clients purchases orders found in this boutique ledger database.
            </div>
          ) : (
            <Card className="p-6">
              <OrderTable orders={orders} onStatusChange={handleStatusChange} />
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default OrdersPage;
