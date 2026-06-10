/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreProducts, useStoreDetail, useDeleteProductMutation } from '../../api/hooks';
import { useAuthStore } from '../../store/useAuthStore';
import { Product } from '../../types';
import { Button, Loading, Card } from '../../components/ui';
import { ProductTable } from '../../components/vendor/ProductTable';
import { Navbar, Footer, PageWrapper, VendorSidebar } from '../../components/shared/layout';
import { Plus } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { useUIStore } from '../../store/useUIStore';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useAuthStore((s) => s.store);
  const showToast = useUIStore((s) => s.showToast);

  const { data: storeDetail } = useStoreDetail(store?.slug || '');
  const { data: products, isLoading, refetch } = useStoreProducts(store?.slug || '');
  const deleteProductMutation = useDeleteProductMutation();

  const handleEdit = (product: Product) => {
    navigate(ROUTES.VENDOR_PRODUCT_EDIT.replace(':id', product.id));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you absolutely sure you want to delete this listing from your showroom? This cannot be undone.')) {
      deleteProductMutation.mutate(id, {
        onSuccess: () => {
          showToast('Boutique catalog item removed.', 'success');
          refetch();
        }
      });
    }
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    // Mock status toggle publish / archive
    showToast(`Catalog item status toggled successfully!`, 'success');
  };

  const handleView = (slug: string) => {
    navigate(ROUTES.PRODUCT_DETAIL.replace(':slug', slug));
  };

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <VendorSidebar />

        <div className="flex-1 space-y-6" id="merchant-products-collection">
          <div className="border-b border-neutral-100 pb-4 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono">My Showroom collections</span>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">Manage Garment Showroom</h1>
            </div>
            <Button size="sm" onClick={() => navigate(ROUTES.VENDOR_PRODUCT_CREATE)}>
              <Plus className="w-4.5 h-4.5 mr-1" /> Curate New Listing
            </Button>
          </div>

          {isLoading ? (
            <Loading text="Retrieving curated garments indices..." />
          ) : !products || products.length === 0 ? (
            <div className="text-center py-20 border rounded-xl border-dashed bg-white text-neutral-400 text-xs">
              No garments listed in your boutique. Sourced collections yet.
            </div>
          ) : (
            <Card className="p-6">
              <ProductTable
                products={products}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusToggle={handleStatusToggle}
                onView={handleView}
              />
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default ProductsPage;
