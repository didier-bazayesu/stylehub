/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StatsCard } from '../../components/shared/cards';
import { Card, CardBody, CardHeader } from '../../components/ui';
import { Navbar, Footer, PageWrapper, AdminSidebar } from '../../components/shared/layout';
import { DollarSign, Percent, TrendingUp, ShieldCheck } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-6" id="admin-analytics-view">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">Platform financial terminals</span>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">Sourced Finance Analytics</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Platform GMV" value="$128,420.00" change="14.8%" icon="revenue" />
            <StatsCard title="Total Orders Checked" value="482 ORDERS" change="6.2%" icon="orders" />
            <StatsCard title="Admin Net commissions" value="$7,705.20" change="14.5%" icon="customers" />
            <StatsCard title="Average order cart" value="$266.43" change="8.1%" icon="products" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="font-extrabold text-neutral-900 text-xs">Commission breakdown splits</div>
              </CardHeader>
              <CardBody className="space-y-3 text-xs leading-relaxed text-neutral-500">
                <p>Default escrow protocol: 6% Platform administration commission fee collected on all approved partner sale transactions.</p>
                <div className="p-4 bg-neutral-25 rounded-xl border text-neutral-600 font-medium">
                  escrow reserves: $7,705.20 currently held in liquid bank reserves, matching scheduled week merchant auto-disbursements.
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="font-extrabold text-neutral-900 text-xs text-neutral-405 font-mono uppercase">operational metrics parameters</div>
              </CardHeader>
              <CardBody className="space-y-2">
                <div className="flex justify-between items-center text-xs text-neutral-700 py-1.5 border-b border-dashed">
                  <span className="font-bold">Retro Threads Sales Payouts</span>
                  <span className="text-emerald-700 font-semibold">$12,842.00 (Pending payout)</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-700 py-1.5 border-b border-dashed">
                  <span className="font-bold">Active refund claims</span>
                  <span className="text-neutral-500">0 cases outstanding</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-700 py-1.5 border-b border-dashed">
                  <span className="font-bold">Total Platform active sessions</span>
                  <span className="text-neutral-450">21,920 sessions today</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default AnalyticsPage;
