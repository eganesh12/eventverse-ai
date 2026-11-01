import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for personal events and trying out EventVerse AI.",
    features: [
      "2 active events",
      "AI event planning (basic)",
      "Budget tracking",
      "Up to 50 guests",
      "Basic vendor search",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    description: "For families and professionals planning multiple events.",
    features: [
      "Unlimited events",
      "Full multi-agent AI planning",
      "Advanced budget intelligence",
      "Unlimited guests",
      "Vendor marketplace & quotes",
      "Guest management & RSVPs",
      "AI Creative Studio",
      "Team collaboration (5 members)",
      "PDF & Excel exports",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    href: "/register?plan=pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "₹3,999",
    period: "/month",
    description: "For event agencies, corporates, and large organizations.",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "White-label options",
      "API access",
      "Custom AI training",
      "Dedicated account manager",
      "SLA guarantee",
      "Advanced analytics",
      "Multi-organization management",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.highlighted
                  ? "border-violet-500 bg-gradient-to-b from-violet-50 to-white dark:from-violet-950 dark:to-slate-900 shadow-xl shadow-violet-100 dark:shadow-violet-900/20"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-white text-xs font-bold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-violet-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  variant={plan.highlighted ? "gradient" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
