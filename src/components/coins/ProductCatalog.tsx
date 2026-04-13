'use client';

import { useState } from 'react';
import type { CoinProduct, ProductCategory } from '@/lib/types/economy';
import { coinsToUsd } from '@/lib/coins/products';

type ProductCatalogProps = {
  products: CoinProduct[];
};

const TABS: { label: string; value: ProductCategory }[] = [
  { label: 'Record Building', value: 'record_building' },
  { label: 'Network', value: 'network' },
  { label: 'Certification', value: 'certification' },
  { label: 'Credentialing', value: 'credentialing' },
  { label: 'Products', value: 'product' },
];

export default function ProductCatalog({ products }: ProductCatalogProps) {
  const [activeTab, setActiveTab] = useState<ProductCategory>('record_building');

  const filtered = products.filter((p) => p.category === activeTab);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#0A1628]">Product Catalog</h2>
        <p className="text-sm text-gray-500 mt-1">
          Everything your Sky Coins can do for your professional standing.
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-3 flex gap-1 overflow-x-auto border-b border-gray-100" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-2 text-xs font-medium rounded-t whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? 'text-[#C5933A] border-b-2 border-[#C5933A] bg-[#C5933A]/5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product list */}
      <div className="divide-y divide-gray-50" role="tabpanel">
        {filtered.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            No products in this category.
          </div>
        ) : (
          filtered.map((product) => (
            <div key={product.id} className="px-6 py-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                {product.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{product.description}</p>
                )}
                {product.earnCoins > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Recipient earns: {product.earnCoins.toLocaleString()} coins
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {product.costCoins === 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-green-50 text-green-700 rounded">
                    Included with Membership
                  </span>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[#0A1628]">
                      {product.costCoins.toLocaleString()} coins
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {coinsToUsd(product.costCoins)}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
