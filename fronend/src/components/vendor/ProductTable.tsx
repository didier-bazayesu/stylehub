/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { getOrderStatusColor } from '../../lib/helpers';
import { Edit2, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '../ui';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onStatusToggle: (id: string, currentStatus: string) => void;
  onView: (slug: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onStatusToggle,
  onView,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = products.filter(
    (p) => filterStatus === 'all' || p.status === filterStatus
  );

  return (
    <div className="space-y-4" id="vendor-products-table">
      {/* Filtering header */}
      <div className="flex gap-2">
        {['all', 'ACTIVE', 'DRAFT', 'ARCHIVED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
              filterStatus === status
                ? 'bg-neutral-900 border-neutral-900 text-white'
                : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl bg-white text-neutral-400 text-xs">
          No garments matching search parameters or status filter.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Garment Details</TableHead>
              <TableHead>Base price</TableHead>
              <TableHead>Active stock</TableHead>
              <TableHead>Status badge</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => {
              const primaryImg = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=100&fit=crop';
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={primaryImg}
                        alt={product.name}
                        className="w-10 h-14 object-cover rounded border"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-neutral-800 line-clamp-1">{product.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">Slug: {product.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(product.base_price)}</TableCell>
                  <TableCell>
                    <span className={product.total_stock < 5 ? 'text-rose-600 font-bold' : 'text-neutral-600'}>
                      {product.total_stock} left
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'ACTIVE' ? 'success' : product.status === 'DRAFT' ? 'warning' : 'outline'}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => onView(product.slug)} title="View Detail">
                        <Eye className="w-4 h-4 text-neutral-500" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onEdit(product)} title="Edit Boutique Item">
                        <Edit2 className="w-4 h-4 text-neutral-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onStatusToggle(product.id, product.status)}
                        title={product.status === 'ACTIVE' ? 'Archive Product' : 'Publish Product'}
                      >
                        {product.status === 'ACTIVE' ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-neutral-400" />
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(product.id)} title="Delete Item">
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
export default ProductTable;
