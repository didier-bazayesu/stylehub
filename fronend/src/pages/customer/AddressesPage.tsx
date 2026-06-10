/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAddresses, useCreateAddressMutation, useDeleteAddressMutation } from '../../api/hooks';
import { Address } from '../../types';
import { Button, Card, CardBody, Loading, Dialog } from '../../components/ui';
import { AddressCard } from '../../components/customer/AddressCard';
import { AddressForm } from '../../components/shared/forms';
import { Navbar, Footer, PageWrapper, CustomerSidebar } from '../../components/shared/layout';
import { Plus, Mail } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const AddressesPage: React.FC = () => {
  const { data: addresses, isLoading } = useAddresses();
  const showToast = useUIStore((s) => s.showToast);

  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectAddressEdit, setSelectAddressEdit] = useState<Address | null>(null);

  const createAddressMutation = useCreateAddressMutation();
  const deleteAddressMutation = useDeleteAddressMutation();

  const handleCreateOrUpdate = (data: any) => {
    // If selective edit
    createAddressMutation.mutate({
      ...data,
      is_default: data.is_default || false,
    }, {
      onSuccess: () => {
        showToast('Destination address record processed successfully!', 'success');
        setIsOpenForm(false);
        setSelectAddressEdit(null);
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteAddressMutation.mutate(id, {
      onSuccess: () => {
        showToast('Logistics address record purged.', 'success');
      }
    });
  };

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <CustomerSidebar />

        <div className="flex-1 space-y-6" id="buyer-logistics-desk">
          <div className="border-b border-neutral-100 pb-4 flex justify-between items-end">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Saved Freight Destinations</h1>
            <Button size="sm" onClick={() => { setSelectAddressEdit(null); setIsOpenForm(true); }}>
              <Plus className="w-4.5 h-4.5 mr-1" /> Record New Destination
            </Button>
          </div>

          {isLoading ? (
            <Loading text="Scanning verified logistics accounts..." />
          ) : !addresses || addresses.length === 0 ? (
            <div className="text-center py-16 border rounded-xl border-dashed bg-white text-neutral-400 text-xs">
              No cargo destination recorded yet. Set shipping address.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="addresses-cards-grid">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onEdit={(editing) => { setSelectAddressEdit(editing); setIsOpenForm(true); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FORM MODAL MODIFIERS */}
      {(isOpenForm) && (
        <Dialog
          isOpen={isOpenForm}
          onClose={() => { setIsOpenForm(false); setSelectAddressEdit(null); }}
          title={selectAddressEdit ? 'Edit Shipping Destination' : 'Record New Shipping Destination'}
        >
          <div className="p-1">
            <AddressForm
              initialValues={selectAddressEdit || undefined}
              onSubmit={handleCreateOrUpdate}
              isLoading={createAddressMutation.isPending}
            />
          </div>
        </Dialog>
      )}

      <Footer />
    </PageWrapper>
  );
};
export default AddressesPage;
