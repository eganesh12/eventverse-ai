const plans = [
  {
    type: "Wedding",
    emoji: "💍",
    event: "Traditional Hindu Wedding",
    location: "Hyderabad",
    guests: 300,
    budget: "₹15,00,000",
    highlights: [
      "Mehendi, Sangeet, Haldi, Wedding, Reception",
      "Outdoor venue with mandap setup",
      "Vegetarian Hyderabadi catering",
      "Live dhol and classical music",
      "Professional photography & videography",
    ],
    color: "event-card-wedding",
  },
  {
    type: "Corporate",
    emoji: "💼",
    event: "Annual Company Summit",
    location: "Bengaluru",
    guests: 200,
    budget: "₹8,00,000",
    highlights: [
      "2-day conference at hotel",
      "Keynote + breakout sessions",
      "Team building activities",
      "Gala dinner and awards",
      "Live streaming setup",
    ],
    color: "event-card-corporate",
  },
  {
    type: "College Fest",
    emoji: "🎓",
    event: "TechFest 2027",
    location: "Chennai",
    guests: 1500,
    budget: "₹5,00,000",
    highlights: [
      "3-day event with 12 competitions",
      "Celebrity performer night",
      "Hackathon & robotics challenge",
      "Food stalls and marketplace",
      "Sponsorship management",
    ],
    color: "event-card-college",
  },
];

export function ExamplePlans() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            See Real Event Plans
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Example AI-generated event plans. These are demo plans to illustrate platform capabilities.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <span>⚠️</span>
            <span>Demo data only — not real vendor quotes or bookings</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.event}
              className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
            >
              <div className={`${plan.color} p-6`}>
                <div className="text-4xl mb-2">{plan.emoji}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {plan.type}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {plan.event}
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {plan.location} · {plan.guests} guests · {plan.budget}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  AI Plan Includes
                </div>
                <ul className="space-y-2">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-violet-500 mt-0.5">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
