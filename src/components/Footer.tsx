export default function Footer() {
  return (
    <footer className="bg-[var(--gs-navy)] border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[var(--gs-accent)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">GS</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg">Grey Sky</span>
                <span className="text-[var(--gs-silver)] text-sm block leading-none">
                  Responder Society
                </span>
              </div>
            </div>
            <p className="text-[var(--gs-silver)] text-sm max-w-md leading-relaxed">
              The premier professional society for disaster response specialists.
              Credentialing, training, and deployment readiness built on FEMA NQS
              standards.
            </p>
            <p className="text-[var(--gs-silver)]/60 text-xs mt-4">
              A{" "}
              <a
                href="https://longviewsolutionsgroup.com"
                className="hover:text-white transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Longview Solutions Group
              </a>{" "}
              initiative
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Society</h4>
            <ul className="space-y-2">
              <li>
                <a href="#why" className="text-[var(--gs-silver)] hover:text-white text-sm transition">
                  Why Credential
                </a>
              </li>
              <li>
                <a href="#disciplines" className="text-[var(--gs-silver)] hover:text-white text-sm transition">
                  Disciplines
                </a>
              </li>
              <li>
                <a href="#membership" className="text-[var(--gs-silver)] hover:text-white text-sm transition">
                  Membership
                </a>
              </li>
              <li>
                <a href="#about" className="text-[var(--gs-silver)] hover:text-white text-sm transition">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:info@greyskyresponder.com"
                  className="text-[var(--gs-silver)] hover:text-white text-sm transition"
                >
                  info@greyskyresponder.com
                </a>
              </li>
              <li className="text-[var(--gs-silver)] text-sm">
                Tallahassee, FL
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-[var(--gs-silver)]/60 text-xs">
            © {new Date().getFullYear()} Grey Sky Responder Society. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
