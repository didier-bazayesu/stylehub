/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUsers } from '../../api/hooks';
import { UserTable } from '../../components/admin/UserTable';
import { Card, Loading } from '../../components/ui';
import { Navbar, Footer, PageWrapper, AdminSidebar } from '../../components/shared/layout';
import { useUIStore } from '../../store/useUIStore';

export const UsersPage: React.FC = () => {
  const { data: users, isLoading } = useUsers();
  const showToast = useUIStore((s) => s.showToast);

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    showToast(currentStatus ? 'User profile frozen' : 'User profile re-activated', 'success');
  };

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-6" id="admin-user-ledger-management">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">buyer roster administration</span>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">Manage Curated Customers</h1>
          </div>

          {isLoading ? (
            <Loading text="Scanning verified identities log files..." />
          ) : (
            <Card className="p-6">
              <UserTable users={users || []} onToggleStatus={handleToggleStatus} />
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default UsersPage;
