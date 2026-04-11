import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPublicIncidents, getFeaturedIncidents } from '@/lib/actions/incidents';
import IncidentSearchResult from '@/components/incidents/IncidentSearchResult';

export const metadata = {
  title: 'Where We Serve | Grey Sky Responder Society',
  description: 'The events that define our service. The communities we stand with.',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default async function PublicIncidentsPage() {
  const [featured, recent] = await Promise.all([
    getFeaturedIncidents(),
    getPublicIncidents({ per_page: 12 }),
  ]);

  return (
    <>
      <Header />
      <main className="pt-20 pb-16">
        {/* Hero */}
        <section className="bg-[var(--gs-navy)] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Where We Serve</h1>
            <p className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">
              The events that define our service. The communities we stand with.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured */}
          {featured.length > 0 && (
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Featured</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/incidents/${incident.slug}`}
                    className="block p-5 border border-[var(--gs-cloud)] rounded-lg hover:border-[var(--gs-gold)] hover:shadow-md transition-all bg-white"
                  >
                    <h3 className="text-base font-semibold text-[var(--gs-navy)]">{incident.name}</h3>
                    <p className="text-sm text-[var(--gs-steel)] mt-1">
                      {incident.location_state} &middot; {formatDate(incident.incident_start_date)}
                    </p>
                    {incident.responder_count > 0 && (
                      <p className="text-xs text-[var(--gs-gold)] font-medium mt-2">
                        {incident.responder_count} member{incident.responder_count !== 1 ? 's' : ''} served
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All Public Incidents */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">All Incidents</h2>
            {recent.data.length === 0 ? (
              <p className="text-sm text-[var(--gs-steel)] py-8 text-center">
                No public incidents yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recent.data.map((incident) => (
                  <IncidentSearchResult
                    key={incident.id}
                    incident={incident}
                    basePath="/incidents"
                  />
                ))}
              </div>
            )}
          </section>

          {/* CTA */}
          <section className="mt-16 text-center py-12 bg-[var(--gs-navy)] rounded-2xl">
            <h2 className="text-xl font-bold text-white">Were you there?</h2>
            <p className="text-gray-300 mt-2 text-sm max-w-md mx-auto">
              Join Grey Sky and record your service. Every deployment tells a story.
            </p>
            <Link
              href="/join"
              className="inline-block mt-4 px-6 py-2.5 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 transition-colors"
            >
              Tell Your Story
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
