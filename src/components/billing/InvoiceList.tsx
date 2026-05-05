// GSR-DOC-208: Server-rendered list of past invoices for a user.
import type { InvoiceRecord } from '@/lib/stripe/invoices';

interface InvoiceListProps {
  invoices: InvoiceRecord[];
}

function formatCurrency(cents: number, currency: string): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function statusPill(status: string): React.ReactNode {
  const colorClass =
    status === 'paid'
      ? 'bg-green-100 text-green-800'
      : status === 'open'
        ? 'bg-amber-100 text-amber-800'
        : status === 'uncollectible' || status === 'void'
          ? 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}

export default function InvoiceList({ invoices }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No invoices yet. Once you start a membership or purchase coins, your receipts will show up here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium text-gray-700">Date</th>
            <th className="px-3 py-2 font-medium text-gray-700">Invoice</th>
            <th className="px-3 py-2 font-medium text-gray-700">Amount</th>
            <th className="px-3 py-2 font-medium text-gray-700">Status</th>
            <th className="px-3 py-2 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="px-3 py-2 text-gray-700">{formatDate(inv.paid_at ?? inv.created_at)}</td>
              <td className="px-3 py-2 text-gray-700">{inv.invoice_number ?? inv.stripe_invoice_id}</td>
              <td className="px-3 py-2 text-gray-700">
                {formatCurrency(inv.amount_paid_cents || inv.amount_due_cents, inv.currency)}
              </td>
              <td className="px-3 py-2">{statusPill(inv.status)}</td>
              <td className="px-3 py-2 space-x-3">
                {inv.hosted_invoice_url ? (
                  <a
                    href={inv.hosted_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--gs-navy)] underline hover:opacity-80"
                  >
                    View
                  </a>
                ) : null}
                {inv.invoice_pdf_url ? (
                  <a
                    href={inv.invoice_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--gs-navy)] underline hover:opacity-80"
                  >
                    PDF
                  </a>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
