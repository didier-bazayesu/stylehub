/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useProducts } from '../../api/hooks';
import { Card, Loading, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '../../components/ui';
import { Navbar, Footer, PageWrapper, AdminSidebar } from '../../components/shared/layout';
import { ShieldCheck, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency } from '../../lib/formatters';

export const ProductsPage: React.FC = () => {
  const { data: products, isLoading } = useProducts();
  const showToast = useUIStore((s) => s.showToast);

  const handleToggleFeature = (id: string, currentlyFeatured: boolean) => {
    showToast(currentlyFeatured ? 'Garment removed from curation carousel' : 'Garment pinned as curated feature!', 'success');
  };

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-6" id="admin-garments-hypervisor">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">Platform inventory supervisor</span>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">Sourced Items Inventory</h1>
          </div>

          {isLoading ? (
            <Loading text="Scanning vintage merchandise indices..." />
          ) : !products || products.length === 0 ? (
            <div className="text-center py-20 border rounded-xl border-dashed bg-white text-neutral-401 text-xs">
              No garments listed on the platform.
            </div>
          ) : (
            <Card className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Garment Blueprints</TableHead>
                    <TableHead>Base Value</TableHead>
                    <TableHead>Stock Index</TableHead>
                    <TableHead>System Curation Feature</TableHead>
                    <TableHead className="text-right">Admin Flag Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((prod) => {
                    const img = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=150&fit=crop';
                    return (
                      <TableRow key={prod.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={img} className="w-9 h-12 object-cover rounded border" alt="preview" referrerPolicy="no-referrer" />
                            <div>
                              <p className="font-bold text-neutral-800 text-xs">{prod.name}</p>
                              <p className="text-[9px] text-neutral-450 font-mono">SKO: {prod.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(prod.base_price)}</TableCell>
                        <TableCell>{prod.total_stock} pcs left</TableCell>
                        <TableCell>
                          <Badge variant={prod.is_featured ? 'success' : 'outline'}>
                            {prod.is_featured ? 'Curated feature' : 'Standard list'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleFeature(prod.id, prod.is_featured)}
                            title="Toggle featured showcase status"
                          >
                            {prod.is_featured ? (
                              <ToggleRight className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-neutral-400" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default ProductsPage;
