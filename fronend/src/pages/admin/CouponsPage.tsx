/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card, CardBody, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Dialog } from '../../components/ui';
import { Navbar, Footer, PageWrapper, AdminSidebar } from '../../components/shared/layout';
import { Plus, Percent, Tag, Settings } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const CouponsPage: React.FC = () => {
  const showToast = useUIStore((s) => s.showToast);
  const [isOpenForm, setIsOpenForm] = useState(false);

  const [activeCode, setActiveCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState('10');

  const [coupons, setCoupons] = useState([
    { id: '1', code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 50, active: true },
    { id: '2', code: 'RETRO50', type: 'fixed', value: 50, minOrder: 200, active: true },
  ]);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCode) return;

    setCoupons([
      ...coupons,
      {
        id: Math.random().toString(),
        code: activeCode.toUpperCase().trim(),
        type: 'percentage',
        value: Number(activeDiscount),
        minOrder: 50,
        active: true
      }
    ]);

    showToast(`Campaign promo code ${activeCode.toUpperCase()} configured!`, 'success');
    setIsOpenForm(false);
    setActiveCode('');
  };

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-6" id="admin-coupons-ledger">
          <div className="border-b border-neutral-100 pb-4 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">Platform Campaign modifiers</span>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">Configure Promo Coupons</h1>
            </div>
            <Button size="sm" onClick={() => setIsOpenForm(true)}>
              <Plus className="w-4.5 h-4.5 mr-1" /> Custom Campaign Code
            </Button>
          </div>

          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Code</TableHead>
                  <TableHead>Discount Type</TableHead>
                  <TableHead>Discount Value</TableHead>
                  <TableHead>Min. Order Req.</TableHead>
                  <TableHead className="text-right">Activity Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((cp) => (
                  <TableRow key={cp.id}>
                    <TableCell className="font-mono text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-neutral-450" /> {cp.code}
                    </TableCell>
                    <TableCell className="capitalize text-xs text-neutral-500">{cp.type}</TableCell>
                    <TableCell className="font-bold text-neutral-900">{cp.type === 'percentage' ? `${cp.value}%` : `$${cp.value}.00`}</TableCell>
                    <TableCell className="text-xs">${cp.minOrder}.00</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={cp.active ? 'success' : 'outline'}>{cp.active ? 'ACTIVE' : 'EXPIRED'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      {/* CREATE COUPON MODAL FORM */}
      {isOpenForm && (
        <Dialog
          isOpen={isOpenForm}
          onClose={() => setIsOpenForm(false)}
          title="Create Custom Promo Coupon"
        >
          <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs" id="create-coupon-form">
            <Input
              label="Promo Code Tag (Uppercase)"
              placeholder="e.g. EXTRA20"
              value={activeCode}
              onChange={(e) => setActiveCode(e.target.value)}
              required
            />
            <Input
              label="Discount Value (Percentage %)"
              type="number"
              placeholder="20"
              value={activeDiscount}
              onChange={(e) => setActiveDiscount(e.target.value)}
              required
            />
            <div className="pt-3 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsOpenForm(false)}>Cancel</Button>
              <Button type="submit">Establish Campaign</Button>
            </div>
          </form>
        </Dialog>
      )}

      <Footer />
    </PageWrapper>
  );
};
export default CouponsPage;
