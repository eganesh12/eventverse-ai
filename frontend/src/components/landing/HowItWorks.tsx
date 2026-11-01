const steps = [
  {
    step: "01",
    title: "Describe Your Event",
    description:
      "Tell EventVerse AI about your event in plain language — date, location, budget, guests, and style preferences. No forms needed.",
    icon: "💬",
    color: "bg-violet-100 text-violet-700",
  },
  {
    step: "02",
    title: "AI Generates Your Plan",
    description:
      "Our multi-agent AI analyzes your requirements and generates a complete event plan: budget breakdown, timeline, vendor checklist, and themes.",
    icon: "✨",
    color: "bg-purple-100 text-purple-700",
  },
  {
    step: "03",
    title: "Discover & Book Vendors",
    description:
      "Browse curated vendors in your location and budget range. Request quotes, compare options, and track bookings in one place.",
    icon: "🏪",
    color: "bg-pink-100 text-pink-700",
  },
  {
    step: "04",
    title: "Manage Everything",
    description:
      "Track tasks, manage guest lists, monitor budget spend, and coordinate with your team — all with AI assistance every step of the way.",
    icon: "📊",
    color: "bg-blue-100 text-blue-700",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How EventVerse AI Works
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From idea to execution in minutes, not months.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent z-0 -translate-y-1/2" />
              )}

              <div className="relative z-10 text-center">
                <div
                  className={`inline-flex w-16 h-16 rounded-2xl items-center justify-center text-3xl ${step.color} mb-4 shadow-sm`}
                >
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Step {step.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
