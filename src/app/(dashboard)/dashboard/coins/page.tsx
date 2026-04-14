// TODO: test — unauthenticated redirects to login, balance displays correctly, ledger paginates
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { getBalance, getHistory, getProducts } from '@/lib/coins/actions';
import CoinBalance from '@/components/coins/CoinBalance';
import CoinLedger from '@/components/coins/CoinLedger';
import ProductCatalog from '@/components/coins/ProductCatalog';

export const metadata = {
  title: 'Sky Coins — Grey Sky Responder Society',
};

export default async function CoinsPage() {
  const session = await getUser();
  if (!session) redirect('/login?redirect=/dashboard/coins');

  const [balance, history, products] = await Promise.all([
    getBalance(session.user.id),
    getHistory(session.user.id, 1, 25),
    getProducts(),
  ]);

  // Filter out purchase-type products from catalog display
  const catalogProducts = products.filter((p) => p.category !== 'purchase');

  return (
    <div className="space-y-6 max-w-4xl">
      <CoinBalance balance={balance} />
      <CoinLedger
        transactions={history.transactions}
        total={history.total}
        page={1}
        limit={25}
      />
      <ProductCatalog products={catalogProducts} />
    </div>
  );
}
