/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useVendors } from '../../api/hooks';
import { VendorTable } from '../../components/admin/VendorTable';
import { Card, Loading } from '../../components/ui';
import { Navbar, Footer, PageWrapper, AdminSidebar } from '../../components/shared/layout';
import { useUIStore } from '../../store/useUIStore';

export const VendorsPage: React.FC = () => {
  const { data: vendors, isLoading } = useVendors();
  const showToast = useUIStore((s) => s.showToast);

  const handleApprove = (id: string) => {
    showToast('Boutique partner approved!', 'success');
  };

  const handleReject = (id: string, reason: string) => {
    showToast(`Boutique rejected: ${reason}`, 'warning');
  };

  const handleSuspend = (id: string) => {
    showToast('Boutique suspended successfully', 'error');
  };

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-6" id="admin-vendors-management">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">Boutique Directory control</span>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">Manage Partner Boutiques</h1>
          </div>

          {isLoading ? (
            <Loading text="Scanning vintage directories indexes..." />
          ) : (
            <Card className="p-6">
              <VendorTable
                vendors={vendors || []}
                onApprove={handleApprove}
                onReject={handleReject}
                onSuspend={handleSuspend}
              />
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default VendorsPage;
