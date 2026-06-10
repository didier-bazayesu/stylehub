/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useOrders } from '../../api/hooks';
import { Card, Loading, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Dialog, Button } from '../../components/ui';
import { Navbar, Footer, PageWrapper, AdminSidebar } from '../../components/shared/layout';
import { getOrderStatusColor } from '../../lib/helpers';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Eye, ShieldAlert } from 'lucide-react';
import { Order } from '../../types';

export const OrdersPage: React.FC = () => {
  const { data: orders, isLoading } = useOrders();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-6" id="admin-orders-ledgers">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">Platform sales logs</span>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">Sourced Buyers Orders</h1>
          </div>

          {isLoading ? (
            <Loading text="Scanning vintage transactional ledgers..." />
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-20 border rounded-xl border-dashed bg-white text-neutral-401 text-xs">
              No buyer orders checked out yet.
            </div>
          ) : (
            <Card className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Secure ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Total price</TableHead>
                    <TableHead>Status badge</TableHead>
                    <TableHead className="text-right">Inspection</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((ord) => (
                    <TableRow key={ord.id}>
                      <TableCell className="font-mono text-xs font-bold">{ord.id}</TableCell>
                      <TableCell className="text-xs">{ord.address?.full_name || 'Jessica Miller'}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(ord.total)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getOrderStatusColor(ord.status)}>{ord.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setActiveOrder(ord)}>
                          <Eye className="w-4.5 h-4.5 text-neutral-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>

      {/* INSPECTION MODAL */}
      {activeOrder && (
        <Dialog
          isOpen={!!activeOrder}
          onClose={() => setActiveOrder(null)}
          title={`Platform Invoice Inspector: ${activeOrder.id}`}
        >
          <div className="space-y-4 text-xs" id="admin-ord-detail">
            <div className="p-4 bg-neutral-25 rounded-xl border space-y-1">
              <p className="font-bold text-neutral-700">Client Logistics Address</p>
              <p className="font-semibold">{activeOrder.address?.full_name}</p>
              <p className="text-neutral-500">{activeOrder.address?.line1}, {activeOrder.address?.city} {activeOrder.address?.postal_code}</p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-neutral-500 font-mono block">Subscribed Items list</span>
              {activeOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-dashed">
                  <div>
                    <p className="font-bold text-neutral-800">{it.product?.name || 'Garment Curated'}</p>
                    <p className="text-[10px] text-neutral-400">Qty: {it.quantity}</p>
                  </div>
                  <span className="font-semibold">{formatCurrency(it.quantity * it.unit_price)}</span>
                </div>
              ))}
            </div>

            <div className="text-right pt-2 border-t font-semibold text-neutral-600">
              <p>Subtotal: {formatCurrency(activeOrder.subtotal)}</p>
              <p>Discount: -{formatCurrency(activeOrder.discount_amount)}</p>
              <p className="text-sm font-black text-neutral-900 mt-1">Grand total: {formatCurrency(activeOrder.total)}</p>
            </div>

            <div className="flex justify-end pt-3">
              <Button size="sm" onClick={() => setActiveOrder(null)}>Acknowledge Inspection</Button>
            </div>
          </div>
        </Dialog>
      )}

      <Footer />
    </PageWrapper>
  );
};
export default OrdersPage;
