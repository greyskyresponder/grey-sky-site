// GSR-DOC-208: Invoice query helpers backed by the cached stripe_invoices
// table. The table is populated by the webhook on invoice.paid /
// invoice.payment_failed / invoice.finalized events.
import { createAdminClient } from '@/lib/supabase/admin';

export interface InvoiceRecord {
  id: number;
  stripe_invoice_id: string;
  amount_paid_cents: number;
  amount_due_cents: number;
  currency: string;
  status: string;
  invoice_number: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export async function listInvoicesForUser(
  userId: string,
  limit = 24,
): Promise<InvoiceRecord[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('stripe_invoices')
    .select(
      'id, stripe_invoice_id, amount_paid_cents, amount_due_cents, currency, status, invoice_number, hosted_invoice_url, invoice_pdf_url, paid_at, period_start, period_end, created_at',
    )
    .eq('user_id', userId)
    .order('paid_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`[stripe.invoices] list failed: ${error.message}`);
  }
  return (data ?? []) as InvoiceRecord[];
}
