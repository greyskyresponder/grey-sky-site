// TODO: test — unauthenticated redirects to login, purchase packages render with Coming Soon state
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import CoinPurchase from '@/components/coins/CoinPurchase';
import Link from 'next/link';

export const metadata = {
  title: 'Add Sky Coins — Grey Sky Responder Society',
};

export default async function PurchasePage() {
  const session = await getUser();
  if (!session) redirect('/login?redirect=/dashboard/coins/purchase');

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <Link
          href="/dashboard/coins"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; Back to Sky Coins
        </Link>
      </div>
      <CoinPurchase />
    </div>
  );
}
