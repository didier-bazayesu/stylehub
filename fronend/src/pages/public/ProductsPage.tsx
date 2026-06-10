/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '../../api/hooks';
import { ProductCard } from '../../components/shared/cards';
import { Loading, Badge, Input, Select } from '../../components/ui';
import { Navbar, Footer, PageWrapper } from '../../components/shared/layout';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFilter = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || 'all';

  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({
    search: searchFilter,
    category: categoryFilter,
    minPrice,
    maxPrice,
    sort: sortBy,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = new URLSearchParams(searchParams);
    if (e.target.value) {
      updated.set('search', e.target.value);
    } else {
      updated.delete('search');
    }
    setSearchParams(updated);
  };

  const handleCategorySelect = (catId: string) => {
    const updated = new URLSearchParams(searchParams);
    if (catId && catId !== 'all') {
      updated.set('category', catId);
    } else {
      updated.delete('category');
    }
    setSearchParams(updated);
  };

  return (
    <PageWrapper>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="flex flex-col gap-6" id="products-catalog-screen">
          
          {/* Header */}
          <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase font-mono">Preserved Garments</span>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Design Catalog Selection</h1>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-450 uppercase tracking-wide">
              {products?.length || 0} Pieces sourced
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="space-y-6 lg:border-r border-neutral-150 lg:pr-6" id="catalog-filters-bar">
              <div className="flex items-center gap-2 font-black text-neutral-950 text-sm tracking-tight border-b border-neutral-100 pb-3">
                <SlidersHorizontal className="w-4 h-4 text-neutral-700" />
                <span>Filters panel</span>
              </div>

              {/* Keyword Search */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 font-mono">Boutique Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search name, fabric..."
                    value={searchFilter}
                    onChange={handleSearchChange}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-neutral-200 text-xs focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 font-mono">Categories</label>
                <div className="flex flex-col gap-1 text-xs">
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className={`text-left px-2.5 py-1.5 rounded-lg border font-semibold ${
                      categoryFilter === 'all'
                        ? 'bg-neutral-900 text-white border-transparent'
                        : 'text-neutral-500 bg-white border-neutral-200 hover:text-neutral-950'
                    }`}
                  >
                    All Sections
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`text-left px-2.5 py-1.5 rounded-lg border font-semibold ${
                        categoryFilter === cat.id
                          ? 'bg-neutral-900 text-white border-transparent'
                          : 'text-neutral-500 bg-white border-neutral-200 hover:text-neutral-950'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Limits */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 font-mono">Price margins ($)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-white h-10 border border-neutral-200 rounded-lg text-xs px-2.5 focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-white h-10 border border-neutral-200 rounded-lg text-xs px-2.5 focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sorting selectors */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 font-mono">Sort placement</label>
                <Select
                  options={[
                    { label: 'Featured', value: 'featured' },
                    { label: 'Price: Low to High', value: 'price-low-high' },
                    { label: 'Price: High to Low', value: 'price-high-low' },
                    { label: 'Customer Rating', value: 'rating' },
                  ]}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>
            </aside>

            {/* Catalog Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <Loading />
              ) : products?.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-xl text-neutral-400 text-xs">
                  No preserved fashion curations match selected filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="products-catalog-grid">
                  {products?.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </PageWrapper>
  );
};
export default ProductsPage;
