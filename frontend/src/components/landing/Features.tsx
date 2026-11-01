const features = [
  {
    icon: "🧠",
    title: "Multi-Agent AI Planning",
    description:
      "10 specialized AI agents work in concert — from understanding your vision to managing budgets, timelines, vendors, and risks.",
  },
  {
    icon: "💰",
    title: "Smart Budget Intelligence",
    description:
      "AI allocates your budget across categories intelligently. Natural language updates like \u2018reduce budget by \u20b93 lakh\u2019 work instantly.",
  },
  {
    icon: "🗓️",
    title: "Automated Timeline",
    description:
      "AI generates a preparation timeline with dependencies. Change your event date and all deadlines recalculate automatically.",
  },
  {
    icon: "🏪",
    title: "Vendor Marketplace",
    description:
      "Discover verified local vendors filtered by category, location, and budget. Compare quotes side-by-side with AI analysis.",
  },
  {
    icon: "👥",
    title: "Guest Management",
    description:
      "Import guests via CSV, send digital invitations, track RSVPs, manage dietary preferences, and handle seating arrangements.",
  },
  {
    icon: "🎨",
    title: "AI Creative Studio",
    description:
      "Generate event themes, invitation copy, color palettes, social media captions, and decoration concepts with AI.",
  },
  {
    icon: "⚠️",
    title: "Risk Management",
    description:
      "AI identifies weather risks, vendor cancellation risks, and budget overrun risks — with contingency plans ready.",
  },
  {
    icon: "🤝",
    title: "Team Collaboration",
    description:
      "Invite co-organizers, assign tasks, leave comments, track approvals, and see real-time updates from your entire team.",
  },
  {
    icon: "📱",
    title: "PWA & Mobile Ready",
    description:
      "Access your event plans from any device. Install as a progressive web app for offline access and notifications.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need to Plan Extraordinary Events
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A complete event management platform powered by cutting-edge AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 group"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
