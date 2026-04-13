// TODO: test — renders qualifications grouped by category
// TODO: test — credential_number masked as ····1234
// TODO: test — active/expired/verification badges show correctly
// TODO: test — empty state renders with correct copy
import type { UserQualification } from '@/lib/types/profile';

const categoryLabels: Record<string, string> = {
  medical: 'Medical',
  technical: 'Technical',
  leadership: 'Leadership',
  hazmat: 'HazMat',
  communications: 'Communications',
  legal: 'Legal',
  fema_ics: 'FEMA / ICS',
  state_cert: 'State Certification',
  other: 'Other',
};

const verificationBadge: Record<string, { label: string; className: string }> = {
  self_reported: { label: 'Self-Reported', className: 'bg-gray-100 text-gray-600' },
  document_linked: { label: 'Document Linked', className: 'bg-blue-100 text-blue-700' },
  staff_verified: { label: 'Verified', className: 'bg-green-100 text-green-700' },
};

function maskCredential(num: string | null): string | null {
  if (!num) return null;
  if (num.length <= 4) return '····' + num;
  return '····' + num.slice(-4);
}

export default function QualificationsSection({ qualifications }: { qualifications: UserQualification[] }) {
  if (qualifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2">What You Bring</h3>
        <p className="text-sm text-[var(--gs-steel)]">
          Certifications, licenses, credentials — from any source. They all count.
        </p>
      </div>
    );
  }

  const grouped: Record<string, UserQualification[]> = {};
  for (const q of qualifications) {
    const cat = q.category ?? 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(q);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
      <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">What You Bring</h3>
      <div className="space-y-5">
        {Object.entries(grouped).map(([category, quals]) => (
          <div key={category}>
            <p className="text-xs font-medium text-[var(--gs-steel)] uppercase tracking-wider mb-2">
              {categoryLabels[category] ?? category}
            </p>
            <div className="space-y-2">
              {quals.map((q) => {
                const vBadge = verificationBadge[q.verification_status] ?? verificationBadge.self_reported;
                return (
                  <div key={q.id} className="border border-[var(--gs-cloud)] rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-[var(--gs-navy)]">{q.qualification_name}</p>
                        {q.issuing_authority && (
                          <p className="text-xs text-[var(--gs-steel)]">{q.issuing_authority}</p>
                        )}
                        {q.credential_number && (
                          <p className="text-xs text-[var(--gs-steel)] font-mono">{maskCredential(q.credential_number)}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${q.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {q.is_active ? 'Active' : 'Expired'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${vBadge.className}`}>
                          {vBadge.label}
                        </span>
                      </div>
                    </div>
                    {(q.issued_date || q.expiration_date) && (
                      <p className="text-xs text-[var(--gs-steel)] mt-1">
                        {q.issued_date && `Issued ${q.issued_date}`}
                        {q.issued_date && q.expiration_date && ' · '}
                        {q.expiration_date && `Expires ${q.expiration_date}`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
