import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getIncidentBySlug } from '@/lib/actions/incidents';
import IncidentDetail from '@/components/incidents/IncidentDetail';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { incident } = await getIncidentBySlug(slug);
  if (!incident) return { title: 'Incident Not Found' };
  return {
    title: `${incident.name} | Where We Serve | Grey Sky Responder Society`,
    description: incident.description ?? `Learn about ${incident.name} and the responders who served.`,
  };
}

export default async function PublicIncidentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { incident, updates } = await getIncidentBySlug(slug);

  if (!incident || !incident.public_visible) notFound();

  return (
    <>
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/incidents"
            className="inline-flex items-center gap-1 text-sm text-[var(--gs-steel)] hover:text-[var(--gs-navy)] transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Where We Serve
          </Link>

          {/* Hero Image */}
          {incident.hero_image_url && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={incident.hero_image_url}
                alt={incident.name}
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
          )}

          <IncidentDetail incident={incident} updates={updates} />

          {/* CTA */}
          <div className="mt-12 p-6 bg-[var(--gs-navy)] rounded-xl text-center">
            <h2 className="text-lg font-bold text-white">Were you there?</h2>
            <p className="text-gray-300 mt-1 text-sm">
              Join Grey Sky and record your service at this incident.
            </p>
            <Link
              href="/join"
              className="inline-block mt-3 px-5 py-2 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 transition-colors"
            >
              Tell Your Story
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
