/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { getOrderStatusColor } from '../../lib/helpers';
import { Check, Clipboard, Truck } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Select } from '../ui';

interface OrderTableProps {
  orders: Order[];
  onStatusChange: (id: string, status: OrderStatus) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders, onStatusChange }) => {
  return (
    <div id="vendor-orders-table">
      {orders.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl bg-white text-neutral-400 text-xs">
          No clients purchases orders found in this boutique.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Info</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>System status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-xs text-neutral-800">{order.id}</span>
                    <span className="text-[10px] text-neutral-400">{formatDate(order.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-neutral-700">
                    <span className="font-semibold">{order.address?.full_name || 'Anonymous User'}</span>
                    <span className="text-neutral-400">{order.address?.phone}</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getOrderStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 text-xs">
                    <Select
                      options={[
                        { label: 'PENDING', value: 'PENDING' },
                        { label: 'CONFIRMED', value: 'CONFIRMED' },
                        { label: 'PROCESSING', value: 'PROCESSING' },
                        { label: 'SHIPPED', value: 'SHIPPED' },
                        { label: 'DELIVERED', value: 'DELIVERED' },
                        { label: 'CANCELLED', value: 'CANCELLED' },
                      ]}
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                      wrapperClassName="w-36"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
export default OrderTable;
