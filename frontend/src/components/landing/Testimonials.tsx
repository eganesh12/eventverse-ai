const testimonials = [
  {
    name: "Priya Sharma",
    role: "Bride",
    location: "Hyderabad",
    rating: 5,
    avatar: "PS",
    text: "EventVerse AI planned our entire wedding in a single session. The budget breakdown was incredibly detailed and the vendor suggestions saved us weeks of research.",
    eventType: "Wedding",
  },
  {
    name: "Rahul Mehta",
    role: "HR Manager",
    location: "Bengaluru",
    rating: 5,
    avatar: "RM",
    text: "Used it for our company's annual day. The timeline agent was impressive — it caught conflicts we'd have missed and proposed fixes automatically.",
    eventType: "Corporate Event",
  },
  {
    name: "Ananya Krishnan",
    role: "College Fest Head",
    location: "Chennai",
    rating: 5,
    avatar: "AK",
    text: "Managing 1500 attendees across 3 days felt impossible until EventVerse AI. The guest management and task boards kept our 30-person team perfectly coordinated.",
    eventType: "College Fest",
  },
  {
    name: "Vikram Joshi",
    role: "Event Organizer",
    location: "Mumbai",
    rating: 5,
    avatar: "VJ",
    text: "The AI's budget intelligence is remarkable. I said 'reduce catering budget by ₹50K without compromising quality' and it immediately proposed smart alternatives.",
    eventType: "Charity Gala",
  },
  {
    name: "Meera Pillai",
    role: "Mother of the Bride",
    location: "Kochi",
    rating: 5,
    avatar: "MP",
    text: "As someone not tech-savvy, I was amazed. I just described what I wanted in Malayalam-style English and the AI understood perfectly. Truly for everyone.",
    eventType: "Wedding",
  },
  {
    name: "Arjun Nair",
    role: "Startup Founder",
    location: "Pune",
    rating: 5,
    avatar: "AN",
    text: "Planned a product launch event for 300 investors and press. The risk management suggestions alone saved us from a potential venue disaster.",
    eventType: "Corporate Launch",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Loved by Event Planners Across India
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Join thousands who&apos;ve planned extraordinary events with EventVerse AI.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            <span>ℹ️</span>
            <span>Illustrative testimonials — actual reviews will appear after launch</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">
                    {t.role} · {t.location}
                  </div>
                </div>
                <div className="ml-auto">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i} className="text-amber-400 text-xs">★</span>
                    ))}
                  </div>
                  <div className="text-xs text-violet-600 dark:text-violet-400 mt-0.5 text-right">
                    {t.eventType}
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                &ldquo;{t.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
