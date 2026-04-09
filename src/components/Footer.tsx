import Link from "next/link";

const quickLinks = [
  { href: "/standards", label: "Standards" },
  { href: "/story", label: "Tell Your Story" },
  { href: "/community", label: "Community" },
  { href: "/membership", label: "Membership" },
  { href: "/about", label: "About" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--gs-navy)] border-t border-[var(--gs-steel)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded bg-[var(--gs-gold)] flex items-center justify-center">
                <span className="text-[var(--gs-navy)] font-bold text-sm">GS</span>
              </div>
              <div>
                <span className="text-white font-semibold text-sm">Grey Sky Responder Society</span>
              </div>
            </div>
            <p className="text-[var(--gs-silver)] text-sm leading-relaxed">
              Professional development and credentialing for the disaster response workforce.
              Built on FEMA RTLT standards.
            </p>
            <p className="text-[var(--gs-steel)] text-xs mt-3">
              A{" "}
              <a href="https://longviewsg.com" target="_blank" rel="noopener noreferrer" className="text-[var(--gs-silver)] hover:text-[var(--gs-gold)] transition-colors">
                Longview Solutions Group
              </a>{" "}
              initiative
            </p>
          </div>

          <div>
            <h4 className="text-[var(--gs-gold)] font-semibold text-sm mb-4 uppercase tracking-wider">Navigate</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[var(--gs-silver)] hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--gs-gold)] font-semibold text-sm mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm text-[var(--gs-silver)]">
              <li>
                <a href="mailto:info@greysky.org" className="hover:text-white transition-colors">
                  info@greysky.org
                </a>
              </li>
              <li>Tallahassee, FL</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--gs-steel)]/20 text-center">
          <p className="text-[var(--gs-steel)] text-xs">
            &copy; {new Date().getFullYear()} Grey Sky Responder Society. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
