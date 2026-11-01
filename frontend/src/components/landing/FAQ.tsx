"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Is EventVerse AI actually using real AI?",
    a: "Yes. EventVerse AI uses large language models (GPT-4 / Gemini) with a multi-agent architecture built on LangGraph. Each specialized agent handles a specific domain — budgeting, timelines, vendors, risk assessment, and more. AI outputs are validated before being shown to users.",
  },
  {
    q: "Are vendor recommendations real?",
    a: "Vendor discovery searches real vendor data in our database. AI estimates and suggestions are clearly labeled as estimates. Actual vendor quotes only appear after vendors respond to your quote requests — never fabricated.",
  },
  {
    q: "Can I plan an Indian wedding with all functions?",
    a: "Absolutely. EventVerse AI supports multi-day Indian wedding functions — Mehendi, Haldi, Sangeet, Wedding ceremony, Reception, and more. It understands Indian traditions, regional preferences, vegetarian and Jain catering, and INR budgeting with GST.",
  },
  {
    q: "Does it work for corporate events?",
    a: "Yes. Corporate events, conferences, product launches, team offsites, and seminars are fully supported. The AI handles multi-stakeholder coordination, approval workflows, sponsorship tracking, and post-event reporting.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted in transit and at rest. Guest information is isolated per event and never shared with vendors without your explicit permission. We implement row-level security, audit logging, and role-based access control.",
  },
  {
    q: "Can I export my event plan?",
    a: "Yes. Export budgets as Excel files, event plans as PDFs, and guest lists as CSV. Pro and Business plans include additional export formats and scheduled report delivery.",
  },
  {
    q: "What happens if the AI is unavailable?",
    a: "The platform works without AI for all core features — event management, budgeting, vendor management, and guest tracking. AI features gracefully show an unavailable state and can be retried when the service recovers.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpen(open === index ? null : index)}
                aria-expanded={open === index}
              >
                <span className="font-medium text-slate-900 dark:text-white text-sm pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-500 shrink-0 transition-transform",
                    open === index && "rotate-180"
                  )}
                />
              </button>
              {open === index && (
                <div className="px-6 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
