/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StatsCard } from '../shared/cards';

interface StatsOverviewProps {
  stats: {
    revenue: number;
    usersCount: number;
    vendorsCount: number;
    productsCount: number;
  };
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="admin-platform-stats-deck">
      <StatsCard
        title="Platform Total Sales"
        value={`$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        change="14.8%"
        icon="revenue"
        isPositive={true}
      />
      
      <StatsCard
        title="Active Customers"
        value={stats.usersCount}
        change="6.2%"
        icon="customers"
        isPositive={true}
      />

      <StatsCard
        title="Partner Boutiques"
        value={stats.vendorsCount}
        change="12.5%"
        icon="orders"
        isPositive={true}
      />

      <StatsCard
        title="Active Catalog Items"
        value={stats.productsCount}
        change="28.4%"
        icon="products"
        isPositive={true}
      />
    </div>
  );
};
export default StatsOverview;
