import Link from "next/link";
import { EVENT_CATEGORIES } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  wedding: "from-pink-100 to-rose-100 border-pink-200 hover:border-pink-400",
  birthday: "from-yellow-100 to-amber-100 border-yellow-200 hover:border-yellow-400",
  college: "from-purple-100 to-violet-100 border-purple-200 hover:border-purple-400",
  community: "from-green-100 to-emerald-100 border-green-200 hover:border-green-400",
  corporate: "from-blue-100 to-indigo-100 border-blue-200 hover:border-blue-400",
  cultural: "from-orange-100 to-red-100 border-orange-200 hover:border-orange-400",
  charity: "from-rose-100 to-pink-100 border-rose-200 hover:border-rose-400",
  conference: "from-slate-100 to-gray-100 border-slate-200 hover:border-slate-400",
};

export function EventCategories() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Plan Any Type of Event
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From intimate gatherings to large-scale productions, EventVerse AI adapts to every event type with specialized AI planning.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {EVENT_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/register?event_type=${cat.id}`}
              className={`group bg-gradient-to-br ${categoryColors[cat.id]} border rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
            >
              <div className="text-4xl mb-3">{cat.emoji}</div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {cat.label}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Plan with AI →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
