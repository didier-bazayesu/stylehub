/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { StoreForm } from '../../components/vendor/StoreForm';
import { Navbar, Footer, PageWrapper, VendorSidebar } from '../../components/shared/layout';

export const StoreSettingsPage: React.FC = () => {
  const store = useAuthStore((s) => s.store);
  const setAuth = useAuthStore((s) => s.setAuth);
  const showToast = useUIStore((s) => s.showToast);

  const handleSubmit = (data: any) => {
    // Simulate updating brand settings
    const authState = useAuthStore.getState();
    if (authState.user) {
      const updatedStore = {
        ...authState.store,
        ...data,
      };
      setAuth(
        authState.user,
        authState.token || 'dummy_token',
        authState.vendor || undefined,
        updatedStore
      );
      showToast('Boutique brand configurations updated successfully!', 'success');
    }
  };

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <VendorSidebar />

        <div className="flex-1 space-y-6" id="merchant-branding-controls">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono">Boutique identity parameters</span>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">Configure Brand Space</h1>
          </div>

          <StoreForm initialValues={store} onSubmit={handleSubmit} />
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default StoreSettingsPage;
