"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Play, Star, Users, CalendarCheck } from "lucide-react";

const stats = [
  { value: "10,000+", label: "Events Planned", icon: CalendarCheck },
  { value: "50,000+", label: "Happy Users", icon: Users },
  { value: "4.9/5", label: "User Rating", icon: Star },
];

export function Hero() {
  const [demoInput, setDemoInput] = useState("");

  const examplePrompts = [
    "Wedding in Hyderabad for 300 guests, ₹15 lakh budget",
    "Corporate annual day for 200 employees in Mumbai",
    "Birthday party for 50 friends in Bangalore, ₹1 lakh",
  ];

  return (
    <section className="relative min-h-screen hero-gradient flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/40 border border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Event Planning Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
          Plan Any Event with{" "}
          <span className="gradient-text">AI Intelligence</span>
        </h1>

        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          From intimate birthday parties to grand weddings and corporate conferences —
          EventVerse AI understands your vision, manages your budget, discovers vendors,
          and orchestrates every detail so you can focus on celebrating.
        </p>

        {/* AI Input Demo */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5">
            <div className="flex items-center gap-3 px-4 py-2">
              <Sparkles className="w-5 h-5 text-violet-500 shrink-0" />
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Describe your event in natural language..."
                className="flex-1 text-sm bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none"
                aria-label="Event description input"
              />
              <Link href="/register">
                <Button size="sm" variant="gradient" className="shrink-0">
                  Plan Now <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Example prompts */}
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {examplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setDemoInput(prompt)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-300 hover:text-violet-600 transition-all cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/register">
            <Button variant="gradient" size="lg" className="w-full sm:w-auto px-8">
              <Sparkles className="w-5 h-5" />
              Start Planning Free
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
              <Play className="w-4 h-4" />
              See How it Works
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-1">
                <Icon className="w-4 h-4 text-violet-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero image / preview card */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pb-16 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white dark:bg-slate-800 rounded-md px-6 py-1 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                eventverse.ai/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-800 dark:text-white">
                    Sharma Wedding 2027
                  </div>
                  <div className="text-sm text-slate-500">February 14, 2027 · Hyderabad</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  Planning
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Budget", value: "₹15,00,000", color: "bg-violet-50 text-violet-700" },
                  { label: "Spent So Far", value: "₹4,20,000", color: "bg-amber-50 text-amber-700" },
                  { label: "Guests", value: "312", color: "bg-blue-50 text-blue-700" },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-xl p-3 ${stat.color}`}>
                    <div className="text-xs opacity-70 mb-0.5">{stat.label}</div>
                    <div className="text-lg font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Budget Progress</div>
                <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full w-[28%] bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" />
                </div>
                <div className="text-xs text-slate-500">28% of budget allocated</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">AI Suggestions</div>
              {[
                "📸 Book photographer 6 months early",
                "🌸 Marigold season peaks in Feb — good for decor",
                "🏨 Reserve hotel blocks for outstation guests",
              ].map((tip) => (
                <div
                  key={tip}
                  className="text-xs bg-violet-50 dark:bg-violet-900/30 rounded-lg p-2.5 text-slate-700 dark:text-slate-300"
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
