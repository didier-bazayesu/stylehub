/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStoreProducts, useStoreDetail } from '../../api/hooks';
import { StatsCard } from '../../components/shared/cards';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, Loading, Card, CardBody } from '../../components/ui';
import { Navbar, Footer, PageWrapper, VendorSidebar } from '../../components/shared/layout';
import { Plus, ArrowUpRight, Sparkles, Compass, AlertCircle } from 'lucide-react';
import { ROUTES } from '../../config/routes';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useAuthStore((s) => s.store);
  const user = useAuthStore((s) => s.user);

  const { data: storeDetail, isLoading: storeLoading } = useStoreDetail(store?.slug || '');
  const { data: products, isLoading: productsLoading } = useStoreProducts(store?.slug || '');

  if (storeLoading || productsLoading) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="flex-1 flex justify-center py-20">
          <Loading text="Opening merchant terminals..." />
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  // Stock alerts calculations
  const lowStockItems = products?.filter(p => p.total_stock < 8) || [];

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <VendorSidebar />

        <div className="flex-1 space-y-6 animate-fade-in" id="merchant-dashboard">
          
          {/* Header */}
          <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono">boutique administration portal</span>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                Merchant Hub: {storeDetail?.name || 'My Boutique'}
              </h1>
            </div>
            <div className="flex gap-2">
              <Link to={ROUTES.STORE_DETAIL.replace(':slug', storeDetail?.slug || '')} target="_blank">
                <Button size="sm" variant="outline">
                  View Boutique Store <ArrowUpRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Button size="sm" onClick={() => navigate(ROUTES.VENDOR_PRODUCT_CREATE)}>
                <Plus className="w-4 h-4 mr-1.5" /> Curate Item
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="dashboard-metrics-row">
            <StatsCard
              title="Boutique Total Earnings"
              value="$12,842.00"
              change="18.1%"
              icon="revenue"
              isPositive={true}
            />

            <StatsCard
              title="Garment curations"
              value={products?.length || 0}
              change="4.2%"
              icon="products"
              isPositive={true}
            />

            <StatsCard
              title="Processing Orders"
              value="3 pending"
              change="0.0%"
              icon="orders"
              isPositive={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent curated clothing items list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-end border-b pb-2 border-neutral-100">
                <h3 className="text-sm font-black text-neutral-900">Your curated garments ({products?.slice(0, 4).length || 0})</h3>
                <Link to={ROUTES.VENDOR_PRODUCTS} className="text-xs font-semibold text-neutral-500 hover:text-black">Manage entire collection</Link>
              </div>

              {products?.slice(0, 4).map((prod) => {
                const img = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=150&fit=crop';
                return (
                  <Card key={prod.id} className="p-4 flex justify-between items-center bg-white border border-neutral-150">
                    <div className="flex items-center gap-3">
                      <img src={img} className="w-10 h-14 object-cover rounded border" alt="Alt" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-bold text-neutral-800 text-xs">{prod.name}</h4>
                        <span className="text-[10px] text-neutral-400 font-mono">Catalog stock: {prod.total_stock} pcs left</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-neutral-900">${prod.base_price}</span>
                  </Card>
                );
              })}
            </div>

            {/* Low stock alerts panel */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-neutral-900 border-b pb-2 border-neutral-100">Logistics stock alerts</h3>
              
              {lowStockItems.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed text-center text-xs text-neutral-405">
                  Garments levels healthy.
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-4 bg-rose-25 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-[10px] mt-0.5 text-rose-600">Inventory critically sparse: {item.total_stock} pcs left!</p>
                      </div>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => navigate(ROUTES.VENDOR_PRODUCTS)}>
                    Replenish units stock
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default DashboardPage;
