import { PURCHASE_PACKAGES } from '@/lib/coins/products';
import { formatCoinAmount } from '@/lib/coins/products';

export default function CoinPurchase() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#0A1628]">Add Sky Coins</h2>
        <p className="text-sm text-gray-500 mt-1">
          Invest in your professional development. Sky Coins fund certifications,
          credentialing reviews, and professional products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PURCHASE_PACKAGES.map((pkg) => (
          <div
            key={pkg.code}
            className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-6 h-6 rounded-full bg-[#C5933A] flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <span className="text-[9px] font-bold text-[#0A1628]">SC</span>
              </span>
              <span className="text-lg font-bold text-[#0A1628]">
                {pkg.coins.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{formatCoinAmount(pkg.coins)}</p>
            <p className="text-xl font-semibold text-[#0A1628] mb-4">
              ${pkg.priceUsd.toLocaleString()}
            </p>
            <div className="mt-auto">
              {/* Stripe integration deferred to DOC-207 */}
              <button
                disabled
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-400 text-sm font-semibold rounded cursor-not-allowed"
                aria-label={`Purchase ${formatCoinAmount(pkg.coins)} — coming soon`}
              >
                Coming Soon
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        Sky Coins are non-refundable and non-transferable. $1 USD = 10 Sky Coins.
      </p>
    </div>
  );
}
