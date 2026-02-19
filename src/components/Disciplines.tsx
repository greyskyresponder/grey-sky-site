const disciplines = [
  { name: "Urban Search & Rescue", abbrev: "US&R", icon: "🏗️" },
  { name: "Swiftwater / Flood Response", abbrev: "SWFRT", icon: "🌊" },
  { name: "Hazardous Materials", abbrev: "HazMat", icon: "☢️" },
  { name: "SWAT / Tactical", abbrev: "SWAT", icon: "🛡️" },
  { name: "Bomb / Explosive Ordnance", abbrev: "Bomb", icon: "💥" },
  { name: "Waterborne SAR", abbrev: "WSAR", icon: "⚓" },
  { name: "Land Search & Rescue", abbrev: "LSAR", icon: "🏔️" },
  { name: "Small UAS Operations", abbrev: "sUAS", icon: "🛸" },
  { name: "Rotary Wing SAR", abbrev: "RWSAR", icon: "🚁" },
  { name: "Animal Rescue", abbrev: "AR", icon: "🐾" },
  { name: "Incident Management Team", abbrev: "IMT", icon: "📡" },
  { name: "EOC Management Support", abbrev: "EOC", icon: "🏢" },
];

export default function Disciplines() {
  return (
    <section id="disciplines" className="py-20 bg-[var(--gs-navy)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            12 Specialized Response Disciplines
          </h2>
          <p className="text-lg text-[var(--gs-silver)] max-w-2xl mx-auto">
            Credentialing pathways aligned with FEMA&apos;s Resource Typing Library
            Tool (RTLT) across every major disaster response specialty.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {disciplines.map((d, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-[var(--gs-accent)]/40 transition group text-center"
            >
              <div className="text-3xl mb-3">{d.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-[var(--gs-accent)] transition">
                {d.name}
              </h3>
              <span className="text-[var(--gs-silver)] text-xs">{d.abbrev}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-[var(--gs-silver)] text-sm">
            Standards based on{" "}
            <span className="text-[var(--gs-accent)] font-medium">
              FEMA National Qualification System (NQS)
            </span>{" "}
            and Resource Typing Library Tool (RTLT)
          </p>
        </div>
      </div>
    </section>
  );
}
