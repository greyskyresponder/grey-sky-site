const reasons = [
  {
    icon: "⏱️",
    title: "Verified in Days",
    description:
      "Upload your packet, add supervisor references, and receive a credential decision in about ten days so you are ready before the next activation order hits.",
  },
  {
    icon: "📜",
    title: "Deployment History That Travels",
    description:
      "Every mission, task book, and training hour is logged against FEMA NQS positions so jurisdictions can trust your record without another interview loop.",
  },
  {
    icon: "🛰️",
    title: "Roster Visibility",
    description:
      "Incident managers can search, filter, and request you by discipline, typing level, and availability—no cold calls or favors required.",
  },
  {
    icon: "🛡️",
    title: "Command-Level Assurance",
    description:
      "Peer reviewers and former supervisors sign off on your capability. Grey Sky enforces the standard so agencies know exactly who is stepping into their span of control.",
  },
  {
    icon: "🤝",
    title: "Professional Covenant",
    description:
      "Join a society built for responders by responders—a place where mentorship, doctrine fidelity, and servant leadership are mandatory, not optional.",
  },
  {
    icon: "🚀",
    title: "Priority Deployments",
    description:
      "Credentialed members are first in line when Longview or partner agencies mobilize IMTs, EOC support, or specialty response teams across 12 disciplines.",
  },
];

export default function WhyCredential() {
  return (
    <section id="why" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)] mb-4">
            Why Credential with Grey Sky?
          </h2>
          <p className="text-lg text-[var(--gs-steel)] max-w-2xl mx-auto">
            This isn&apos;t a badge factory. It&apos;s the verification engine the emergency
            management community already trusts when they need responders who can execute.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-[var(--gs-cloud)] hover:border-[var(--gs-accent)]/30 hover:shadow-lg transition group"
            >
              <div className="text-3xl mb-4">{reason.icon}</div>
              <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2 group-hover:text-[var(--gs-accent)] transition">
                {reason.title}
              </h3>
              <p className="text-[var(--gs-steel)] text-sm leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
