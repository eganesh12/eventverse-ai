"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { eventsApi, Event } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  DollarSign,
  Users,
  CheckSquare,
  Plus,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, formatRelativeDate, calculateBudgetProgress, getBudgetStatusColor, EVENT_CATEGORIES } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Demo data for initial state / fallback
const DEMO_STATS = {
  totalEvents: 3,
  activeEvents: 2,
  totalBudget: 2400000,
  totalSpent: 680000,
  pendingTasks: 14,
  guestsPending: 47,
};

const DEMO_BUDGET_TREND = [
  { month: "Aug", allocated: 0, spent: 0 },
  { month: "Sep", allocated: 200000, spent: 80000 },
  { month: "Oct", allocated: 500000, spent: 250000 },
  { month: "Nov", allocated: 800000, spent: 420000 },
  { month: "Dec", allocated: 1200000, spent: 600000 },
  { month: "Jan", allocated: 1600000, spent: 680000 },
];

const DEMO_BUDGET_CATEGORIES = [
  { name: "Venue", value: 400000, color: "#7c3aed" },
  { name: "Catering", value: 300000, color: "#a855f7" },
  { name: "Decor", value: 180000, color: "#ec4899" },
  { name: "Photography", value: 120000, color: "#f97316" },
  { name: "Others", value: 200000, color: "#06b6d4" },
];

const DEMO_EVENTS = [
  {
    id: "1",
    title: "Sharma Wedding",
    type: "wedding",
    date: "2027-02-14",
    location: "Hyderabad",
    guest_count: 312,
    total_budget: 1500000,
    total_expenses: 420000,
    status: "planning",
    task_completion: 35,
  },
  {
    id: "2",
    title: "Team Annual Day",
    type: "corporate",
    date: "2026-12-20",
    location: "Bengaluru",
    guest_count: 180,
    total_budget: 800000,
    total_expenses: 260000,
    status: "in_progress",
    task_completion: 68,
  },
  {
    id: "3",
    title: "Rahul's Birthday",
    type: "birthday",
    date: "2026-11-28",
    location: "Mumbai",
    guest_count: 45,
    total_budget: 100000,
    total_expenses: 0,
    status: "draft",
    task_completion: 10,
  },
];

const AI_TIPS = [
  "📸 Book your wedding photographer at least 6 months in advance — best ones fill up fast.",
  "💐 February is peak marigold season in Hyderabad — perfect for mandap decorations.",
  "🏨 Reserve hotel room blocks for outstation guests by November to lock in group rates.",
  "🎵 Sangeet venue acoustics matter — check if your shortlisted venues have sound restrictions.",
];

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EventStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "success" | "warning" | "info" | "secondary"> = {
    draft: "secondary",
    planning: "info",
    confirmed: "success",
    in_progress: "warning",
    completed: "success",
    cancelled: "secondary",
  };
  return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list({ limit: 5 }),
  });

  const events = (eventsData?.items as Event[] | undefined) ?? (DEMO_EVENTS as unknown as Event[]);
  const stats = DEMO_STATS;
  const randomTip = AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {greeting()}, {user?.full_name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Here&apos;s what&apos;s happening with your events today.
          </p>
        </div>
        <Link href="/events/new">
          <Button variant="gradient">
            <Plus className="w-4 h-4" />
            New Event
          </Button>
        </Link>
      </div>

      {/* AI Quick Tip */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 border border-violet-200 dark:border-violet-800">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-0.5">
            AI Tip of the Day
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{randomTip}</p>
        </div>
        <Link href="/ai-planner" className="ml-auto shrink-0">
          <Button variant="ghost" size="sm" className="text-violet-600 dark:text-violet-400">
            Chat with AI <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Events"
          value={stats.activeEvents.toString()}
          subtitle={`${stats.totalEvents} total events`}
          icon={CalendarDays}
          color="bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
        />
        <StatCard
          title="Total Budget"
          value={formatCurrency(stats.totalBudget)}
          subtitle={`${formatCurrency(stats.totalSpent)} spent`}
          icon={DollarSign}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks.toString()}
          subtitle="Across all events"
          icon={CheckSquare}
          color="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
        />
        <StatCard
          title="Awaiting RSVP"
          value={stats.guestsPending.toString()}
          subtitle="Guests pending response"
          icon={Users}
          color="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
      </div>

      {/* Charts + Events Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget trend chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Budget Overview</CardTitle>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-violet-500 inline-block" /> Allocated
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-pink-500 inline-block" /> Spent
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={DEMO_BUDGET_TREND}>
                <defs>
                  <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: number) => formatCurrency(val)}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="allocated"
                  stroke="#7c3aed"
                  fill="url(#colorAllocated)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="spent"
                  stroke="#ec4899"
                  fill="url(#colorSpent)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={DEMO_BUDGET_CATEGORIES}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {DEMO_BUDGET_CATEGORIES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {DEMO_BUDGET_CATEGORIES.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-400">{cat.name}</span>
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatCurrency(cat.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Your Events</CardTitle>
            <Link href="/events">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {events.map((event) => {
              const cat = EVENT_CATEGORIES.find((c) => c.id === event.type);
              const budgetPct = calculateBudgetProgress(
                event.total_expenses || 0,
                event.total_budget
              );
              return (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 flex items-center justify-center text-xl shrink-0">
                      {cat?.emoji || "📅"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {event.title}
                        </p>
                        <EventStatusBadge status={event.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {formatDate(event.date)} · {formatRelativeDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.guest_count} guests
                        </span>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {formatCurrency(event.total_budget)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={budgetPct} className="w-24 h-1.5" />
                        <span
                          className={`text-xs font-medium ${getBudgetStatusColor(budgetPct)}`}
                        >
                          {budgetPct}%
                        </span>
                      </div>
                    </div>

                    <div className="hidden lg:flex flex-col items-end shrink-0">
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Tasks
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress
                          value={(event as unknown as { task_completion?: number }).task_completion || 0}
                          className="w-16 h-1.5"
                          indicatorClassName="bg-emerald-500"
                        />
                        <span className="text-xs font-medium text-emerald-600">
                          {(event as unknown as { task_completion?: number }).task_completion || 0}%
                        </span>
                      </div>
                    </div>

                    <TrendingUp className="w-4 h-4 text-slate-300 shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
