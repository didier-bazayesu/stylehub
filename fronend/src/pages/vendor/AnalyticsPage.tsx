/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StatsCard } from '../../components/shared/cards';
import { Card, CardBody, CardHeader } from '../../components/ui';
import { Navbar, Footer, PageWrapper, VendorSidebar } from '../../components/shared/layout';
import { ShieldAlert, Compass, Calendar, Sparkles } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <VendorSidebar />

        <div className="flex-1 space-y-6" id="merchant-analytics-dashboard">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono">boutique growth index</span>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">Sourced Analytics Metrics</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="merchant-stats-row">
            <StatsCard title="Gross Merchandise Value" value="$82,492.00" change="18.1%" icon="revenue" />
            <StatsCard title="Boutique Sales Count" value="391 PCS" change="12.4%" icon="orders" />
            <StatsCard title="Customer Conversions" value="4.25%" change="1.8%" icon="customers" />
            <StatsCard title="Unique Shop Sessions" value="8,920 LNK" change="31.2%" icon="products" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="font-extrabold text-neutral-900 text-xs">Platform revenue split details</div>
              </CardHeader>
              <CardBody className="space-y-3 text-xs leading-relaxed text-neutral-500">
                <p>Calculated platform commission splits: 94% merchant payout / 6% StyleHub curation upkeep fees.</p>
                <div className="p-4 bg-neutral-25 rounded-xl border border-neutral-150 text-neutral-600 font-medium">
                  We settle merchant balance ledger accounts directly using automated weekly Stripe electronic fund transfers.
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="font-extrabold text-neutral-900 text-xs">Popularly Viewed Catalog Items</div>
              </CardHeader>
              <CardBody className="space-y-2">
                <div className="flex justify-between items-center text-xs text-neutral-700 py-1 border-b border-dashed border-neutral-100">
                  <span className="font-bold">1. 90s Leather Varsity Jacket</span>
                  <span className="text-neutral-500">2,482 pageviews</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-700 py-1 border-b border-dashed border-neutral-100">
                  <span className="font-bold">2. Faded Heavyweight Selvedge Jeans</span>
                  <span className="text-neutral-500">1,920 pageviews</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-700 py-1 border-b border-dashed border-neutral-100">
                  <span className="font-bold">3. Archival USA-made Denim Jacket</span>
                  <span className="text-neutral-500">890 pageviews</span>
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
