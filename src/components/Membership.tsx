const tiers = [
  {
    name: "Society Member",
    monthly: "$10",
    annual: "$99",
    annualSave: "Save $21",
    description: "Join the professional community",
    features: [
      "Member directory access",
      "Peer-to-peer networking",
      "Monthly newsletter & updates",
      "Job board access",
      "Community forums",
      "Annual member events",
    ],
    cta: "Join as Member",
    featured: false,
  },
  {
    name: "Credentialed Responder",
    monthly: "$50",
    annual: "$499",
    annualSave: "Save $101",
    description: "Verify and track your qualifications",
    features: [
      "Everything in Society Member",
      "NQS credential tracking portal",
      "Digital verification badge",
      "Continuing education log",
      "Deployment history record",
      "Credential verification API",
      "Priority job placement",
      "Advanced training access",
    ],
    cta: "Get Credentialed",
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Deployment Ready",
    monthly: "$100",
    annual: "$999",
    annualSave: "Save $201",
    description: "Priority deployment with top teams",
    features: [
      "Everything in Credentialed",
      "Priority deployment placement",
      "Advanced leadership training",
      "Mentorship program access",
      "Annual skills assessment",
      "Equipment certification tracking",
      "Direct team placement",
      "Executive networking events",
    ],
    cta: "Go Deployment Ready",
    featured: false,
  },
];

export default function Membership() {
  return (
    <section id="membership" className="py-20 bg-[var(--gs-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)] mb-4">
            Membership Tiers
          </h2>
          <p className="text-lg text-[var(--gs-steel)] max-w-2xl mx-auto">
            Choose the level that matches your career stage. Every tier builds
            toward deployment readiness.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 relative ${
                tier.featured
                  ? "bg-[var(--gs-navy)] text-white border-2 border-[var(--gs-accent)] shadow-2xl shadow-[var(--gs-accent)]/20 scale-105"
                  : "bg-white border border-[var(--gs-cloud)] hover:border-[var(--gs-accent)]/30 hover:shadow-lg"
              } transition`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--gs-accent)] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {tier.badge}
                </div>
              )}

              <h3
                className={`text-xl font-bold mb-1 ${
                  tier.featured ? "text-white" : "text-[var(--gs-navy)]"
                }`}
              >
                {tier.name}
              </h3>
              <p
                className={`text-sm mb-6 ${
                  tier.featured ? "text-[var(--gs-silver)]" : "text-[var(--gs-steel)]"
                }`}
              >
                {tier.description}
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-extrabold ${
                      tier.featured ? "text-white" : "text-[var(--gs-navy)]"
                    }`}
                  >
                    {tier.annual}
                  </span>
                  <span
                    className={`text-sm ${
                      tier.featured ? "text-[var(--gs-silver)]" : "text-[var(--gs-steel)]"
                    }`}
                  >
                    /year
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-sm ${
                      tier.featured ? "text-[var(--gs-silver)]" : "text-[var(--gs-steel)]"
                    }`}
                  >
                    or {tier.monthly}/month
                  </span>
                  <span className="text-xs font-medium text-[var(--gs-success)] bg-[var(--gs-success)]/10 px-2 py-0.5 rounded-full">
                    {tier.annualSave}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <svg
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        tier.featured ? "text-[var(--gs-accent)]" : "text-[var(--gs-success)]"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className={
                        tier.featured ? "text-[var(--gs-silver)]" : "text-[var(--gs-steel)]"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#join"
                className={`block text-center py-3 rounded-lg font-semibold text-sm transition ${
                  tier.featured
                    ? "bg-[var(--gs-accent)] hover:bg-[var(--gs-accent-dark)] text-white"
                    : "bg-[var(--gs-navy)] hover:bg-[var(--gs-slate)] text-white"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
