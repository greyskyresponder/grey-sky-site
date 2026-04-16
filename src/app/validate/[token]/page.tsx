import { getValidationByToken } from '@/lib/validation/actions';
import { ValidationResponseForm } from '@/components/validation/ValidationResponseForm';

type Props = { params: Promise<{ token: string }> };

export default async function ValidatePage({ params }: Props) {
  const { token } = await params;
  const view = await getValidationByToken(token);

  return (
    <div className="min-h-screen bg-[var(--gs-white)]">
      <header className="bg-[var(--gs-navy)] text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide opacity-75">Grey Sky Responder Society</div>
            <div className="text-lg font-semibold">Deployment Validation Request</div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {view ? (
          <ValidationResponseForm token={token} view={view} />
        ) : (
          <InvalidTokenState />
        )}
      </main>
    </div>
  );
}

function InvalidTokenState() {
  return (
    <div className="bg-white rounded-lg border border-[var(--gs-cloud)] p-8 text-center">
      <h2 className="text-xl font-semibold text-[var(--gs-navy)] mb-2">
        This validation link is not valid
      </h2>
      <p className="text-sm text-[var(--gs-steel)]">
        The link may have expired, already been used, or never existed. If you believe this is a
        mistake, ask the member who contacted you to send a new request.
      </p>
    </div>
  );
}
