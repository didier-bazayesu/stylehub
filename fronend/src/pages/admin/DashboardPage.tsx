/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useVendors, useUsers, useProducts } from '../../api/hooks';
import { StatsOverview } from '../../components/admin/StatsOverview';
import { VendorTable } from '../../components/admin/VendorTable';
import { Card, CardBody, Loading, Badge } from '../../components/ui';
import { Navbar, Footer, PageWrapper, AdminSidebar } from '../../components/shared/layout';
import { Sparkles, Terminal, Activity } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const DashboardPage: React.FC = () => {
  const { data: vendors, isLoading: vLoading, refetch: refetchVendors } = useVendors();
  const { data: users, isLoading: uLoading } = useUsers();
  const { data: products, isLoading: pLoading } = useProducts();
  const showToast = useUIStore((s) => s.showToast);

  if (vLoading || uLoading || pLoading) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="flex-1 flex justify-center py-20">
          <Loading text="Connecting to platform database cluster..." />
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  // Calculate platform broad numbers
  const stats = {
    revenue: 128420.00,
    usersCount: users?.length || 0,
    vendorsCount: vendors?.length || 0,
    productsCount: products?.length || 0,
  };

  // Filter pending applications to highlight
  const pendingApplications = vendors?.filter(v => v.status === 'PENDING') || [];

  const handleApprove = (id: string) => {
    showToast('Merchant boutique application approved successfully!', 'success');
  };

  const handleReject = (id: string, reason: string) => {
    showToast(`Boutique application rejected: ${reason}`, 'warning');
  };

  const handleSuspend = (id: string) => {
    showToast('Selected merchant boutique suspension processed.', 'error');
  };

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-6" id="admin-main-hub">
          {/* Header */}
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">system hypervisor terminals</span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-1 flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-600" /> Platform Super Overview
            </h1>
          </div>

          {/* Quick Stats overview deck */}
          <StatsOverview stats={stats} />

          {/* Table representing merchant boutique registries */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b pb-2 border-neutral-100">
                <h3 className="text-sm font-black text-neutral-900">Boutique Registries Applications ({pendingApplications.length})</h3>
                <span className="text-xs text-neutral-450 font-mono uppercase font-bold">requires approval actions</span>
              </div>

              <Card className="p-6">
                <VendorTable
                  vendors={vendors || []}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onSuspend={handleSuspend}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default DashboardPage;
