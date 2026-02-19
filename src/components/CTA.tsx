export default function CTA() {
  return (
    <section
      id="join"
      className="py-20 bg-gradient-to-br from-[var(--gs-accent-dark)] to-[var(--gs-navy)]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Credential Your Expertise?
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Join a growing network of disaster response professionals who are
          setting the standard. Your credentials. Your career. Your community.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#membership"
            className="bg-white text-[var(--gs-navy)] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            View Membership Options
          </a>
          <a
            href="mailto:info@greyskyresponder.com"
            className="border-2 border-white/30 text-white px-8 py-4 rounded-lg text-lg font-medium hover:border-white/60 transition"
          >
            Contact Us
          </a>
        </div>

        <p className="mt-8 text-blue-200 text-sm">
          Questions? Reach us at{" "}
          <a
            href="mailto:info@greyskyresponder.com"
            className="underline hover:text-white"
          >
            info@greyskyresponder.com
          </a>
        </p>
      </div>
    </section>
  );
}
