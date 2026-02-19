export default function About() {
  return (
    <section id="about" className="py-20 bg-[var(--gs-cloud)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)] mb-6">
              Public Servants in the Private Sector
            </h2>
            <div className="space-y-4 text-[var(--gs-steel)] leading-relaxed">
              <p>
                Grey Sky Responder Society was born from a simple truth: the
                disaster response profession needs a standard — and the
                professionals who serve need a home.
              </p>
              <p>
                Founded by{" "}
                <span className="font-semibold text-[var(--gs-navy)]">
                  Longview Solutions Group
                </span>
                , a company that deployed over 220 emergency management
                professionals to Florida&apos;s hurricane response faster than any
                organization — public or private — Grey Sky builds the
                credentialed workforce that communities depend on.
              </p>
              <p>
                Our credentialing framework is built on{" "}
                <span className="font-semibold text-[var(--gs-navy)]">
                  FEMA&apos;s National Qualification System (NQS)
                </span>{" "}
                and the Resource Typing Library Tool (RTLT), ensuring every Grey
                Sky responder meets the federal standard for their discipline.
              </p>
              <p>
                We don&apos;t just credential responders. We build the bench. And
                when disaster strikes, the bench deploys.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-[var(--gs-cloud)] shadow-sm">
              <div className="text-3xl font-extrabold text-[var(--gs-accent)] mb-1">
                220+
              </div>
              <div className="text-[var(--gs-steel)] text-sm">
                Professionals deployed to a single hurricane response
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-[var(--gs-cloud)] shadow-sm">
              <div className="text-3xl font-extrabold text-[var(--gs-accent)] mb-1">
                12
              </div>
              <div className="text-[var(--gs-steel)] text-sm">
                Specialized response disciplines covered
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-[var(--gs-cloud)] shadow-sm">
              <div className="text-3xl font-extrabold text-[var(--gs-accent)] mb-1">
                Hours
              </div>
              <div className="text-[var(--gs-steel)] text-sm">
                Response time — not days, not weeks. Hours.
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-[var(--gs-cloud)] shadow-sm">
              <div className="text-3xl font-extrabold text-[var(--gs-accent)] mb-1">
                NQS
              </div>
              <div className="text-[var(--gs-steel)] text-sm">
                Built on FEMA National Qualification System standards
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
