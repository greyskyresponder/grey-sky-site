const reasons = [
  {
    icon: "🎯",
    title: "Demonstrate Expertise",
    description:
      "Credentialing aligned with FEMA National Qualification System (NQS) standards proves your competence to employers, agencies, and deployment teams.",
  },
  {
    icon: "📈",
    title: "Advance Your Career",
    description:
      "Stand out in a competitive field. Credentialed responders access better positions, higher responsibility, and priority deployment opportunities.",
  },
  {
    icon: "🤝",
    title: "Join a Professional Network",
    description:
      "Connect with seasoned disaster response professionals. Mentorship, peer support, and collaboration with the best in the field.",
  },
  {
    icon: "🚀",
    title: "Deploy Ready",
    description:
      "When disaster strikes, credentialed responders deploy first. Your qualifications are verified, your training is current, and you're ready to go.",
  },
  {
    icon: "📋",
    title: "Track Your Qualifications",
    description:
      "Maintain a verified record of your certifications, training hours, continuing education, and deployment history — all in one place.",
  },
  {
    icon: "🏛️",
    title: "Shape the Standard",
    description:
      "Contribute to the professional development of disaster response. Help build the frameworks that define competence in emergency management.",
  },
];

export default function WhyCredential() {
  return (
    <section id="why" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)] mb-4">
            Why Get Credentialed?
          </h2>
          <p className="text-lg text-[var(--gs-steel)] max-w-2xl mx-auto">
            In disaster response, credentials aren&apos;t just paper — they&apos;re proof
            that you can perform when lives are on the line.
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
