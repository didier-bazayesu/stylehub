/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useUIStore } from '../../store/useUIStore';
import { useAddresses, useCreateOrderMutation } from '../../api/hooks';
import { formatCurrency } from '../../lib/formatters';
import { Button, Card, CardBody, Input, Loading } from '../../components/ui';
import { AddressForm } from '../../components/shared/forms';
import { Navbar, Footer, PageWrapper } from '../../components/shared/layout';
import { Heart, Landmark, Plus, Ticket, ArrowLeft, ShieldCheck, CreditCard, Mail } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { AddressInput } from '../../lib/validators';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const showToast = useUIStore((s) => s.showToast);
  
  const { items, coupon, getCartSubtotal, getDiscountAmount, getShippingCost, getCartTotal, clearCart } = useCartStore();
  const { data: addresses, isLoading: addrLoading } = useAddresses();
  const createOrderMutation = useCreateOrderMutation();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(false);
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);

  // Credit Card mock inputs
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // If cart is empty, redirect back
  React.useEffect(() => {
    if (items.length === 0 && !createOrderMutation.isSuccess) {
      navigate(ROUTES.CART);
    }
  }, [items, navigate, createOrderMutation.isSuccess]);

  // Set default selected address once addresses load
  React.useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find(a => a.is_default) || addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  const handleAddNewAddressSubmit = (data: AddressInput) => {
    setIsAddingAddress(true);
    // Simulate address dispatch
    setTimeout(() => {
      showToast('Shipping address pinned to your directory profile.', 'success');
      setShowNewAddressForm(false);
      setIsAddingAddress(false);
    }, 800);
  };

  const handlePlaceOrder = () => {
    const selectedAddress = addresses?.find(a => a.id === selectedAddressId);
    if (!selectedAddress) {
      showToast('Please register an address before placing an order', 'warning');
      return;
    }

    if (!cardNumber || !cardCvc) {
      showToast('Please fill mock credit card details for processing', 'warning');
      return;
    }

    // Prepare items payload
    const orderItems = items.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: Number(item.variant?.price) || Number(item.product?.base_price),
    }));

    createOrderMutation.mutate({
      items: orderItems,
      address_id: selectedAddressId,
      subtotal: getCartSubtotal(),
      shipping_cost: getShippingCost(),
      discount_amount: getDiscountAmount(),
      coupon_code: coupon?.code,
      total: getCartTotal(),
    }, {
      onSuccess: () => {
        clearCart();
        showToast('Style curation purchased successfully!', 'success');
        navigate(ROUTES.CUSTOMER_ORDERS);
      }
    });
  };

  return (
    <PageWrapper>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="flex flex-col gap-6" id="checkout-view">
          
          {/* Header */}
          <div className="border-b border-neutral-100 pb-4 flex items-center gap-3">
            <button onClick={() => navigate(ROUTES.CART)} className="p-2 border hover:bg-neutral-50 rounded-lg cursor-pointer">
              <ArrowLeft className="w-4 h-4 text-neutral-600" />
            </button>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Checkout Sourcing</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Shipping, Address Selection, Card details */}
            <div className="lg:col-span-2 space-y-6" id="checkout-flows-column">
              
              {/* ADDRESS SELECTION */}
              <div className="p-6 bg-white rounded-xl border border-neutral-150 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-neutral-100">
                  <h3 className="font-bold text-neutral-950 text-sm">1. Delivery Address Registration</h3>
                  {!showNewAddressForm && (
                    <Button size="sm" variant="outline" onClick={() => setShowNewAddressForm(true)}>
                      <Plus className="w-4.5 h-4.5 mr-1" /> Add Address
                    </Button>
                  )}
                </div>

                {showNewAddressForm ? (
                  <div className="p-4 bg-neutral-25 rounded-xl border border-neutral-150">
                    <div className="flex items-center justify-between mb-3 border-b border-neutral-100 pb-2">
                      <span className="text-xs font-bold font-mono text-neutral-500">Record Shipping Address</span>
                      <Button size="sm" variant="ghost" onClick={() => setShowNewAddressForm(false)} className="text-xs font-semibold px-2">Cancel</Button>
                    </div>
                    <AddressForm onSubmit={handleAddNewAddressSubmit} isLoading={isAddingAddress} />
                  </div>
                ) : addrLoading ? (
                  <Loading text="Scanning directory profiles..." />
                ) : !addresses || addresses.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-500">No destinations registered yet. Add a shipping address.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 border rounded-xl cursor-pointer transition-colors relative flex flex-col justify-between ${
                          selectedAddressId === addr.id 
                            ? 'border-neutral-900 bg-neutral-25' 
                            : 'border-neutral-200 bg-white hover:bg-neutral-25'
                        }`}
                      >
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-neutral-900">{addr.full_name}</p>
                          <p className="text-neutral-450">{addr.phone}</p>
                          <p className="text-neutral-600 line-clamp-1">{addr.line1}</p>
                          <p className="text-neutral-500">{addr.city}, {addr.state} {addr.postal_code}</p>
                        </div>
                        {selectedAddressId === addr.id && (
                          <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-neutral-950"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD DETAILS SELECTIONS */}
              <div className="p-6 bg-white rounded-xl border border-neutral-150 shadow-xs space-y-4">
                <h3 className="font-bold text-neutral-950 text-sm border-b pb-3 border-neutral-100">2. Secure Payment Verification</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Name on Secure Card"
                    placeholder="Jessica Miller"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                  <Input
                    label="Mock Credit Card Number (16 Digits)"
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                  <Input
                    label="Expiry Date"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                  <Input
                    label="CVC Security Code (3 Digits)"
                    placeholder="382"
                    maxLength={3}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-neutral-450 font-semibold font-mono">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> SECURE MOCK GATEWAY DEPLOYED
                </div>
              </div>

            </div>

            {/* Price Calculations summarizes */}
            <div className="space-y-6">
              <Card className="p-5 border-neutral-100 shadow-md">
                <h3 className="font-bold text-neutral-950 text-sm border-b pb-3 mb-4">Invoice Specifications</h3>
                
                <div className="space-y-3 max-h-48 overflow-y-auto mb-4 pr-1">
                  {items.map((item) => (
                    <div key={item.variant_id} className="flex justify-between text-xs py-1 border-b border-dashed border-neutral-100">
                      <span className="text-neutral-500 line-clamp-1 max-w-xs">{item.product?.name} x {item.quantity}</span>
                      <span className="font-semibold text-neutral-800">
                        {formatCurrency(item.quantity * (Number(item.variant?.price) || Number(item.product?.base_price)))}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3.5 text-xs text-neutral-600 border-b pb-4">
                  <div className="flex justify-between">
                    <span>Invoice Subtotal</span>
                    <span className="font-semibold text-neutral-800">{formatCurrency(getCartSubtotal())}</span>
                  </div>

                  {coupon && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount ({coupon.code})</span>
                      <span>-{formatCurrency(getDiscountAmount())}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping fee</span>
                    <span className="font-semibold text-neutral-800">
                      {getShippingCost() === 0 ? 'FREE' : formatCurrency(getShippingCost())}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end py-4 mb-4">
                  <span className="text-sm font-bold text-neutral-850">Invoice Total</span>
                  <span className="text-xl font-black text-neutral-900">{formatCurrency(getCartTotal())}</span>
                </div>

                <Button
                  size="lg"
                  className="w-full h-12 font-bold"
                  onClick={handlePlaceOrder}
                  isLoading={createOrderMutation.isPending}
                >
                  Place Secure Style Order
                </Button>
              </Card>

              <div className="p-4 rounded-xl border bg-neutral-25 flex gap-3 text-xs text-neutral-500 leading-normal">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-neutral-800">Authenticity Certificate</p>
                  <p>All items undergo mechanical, zipper, dye, and label checks prior to shipment.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </PageWrapper>
  );
};
export default CheckoutPage;
