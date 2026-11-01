"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { eventsApi, Event } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Filter,
  CalendarDays,
  Users,
  DollarSign,
  MoreHorizontal,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  calculateBudgetProgress,
  EVENT_CATEGORIES,
} from "@/lib/utils";

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "info" | "secondary"> = {
  draft: "secondary",
  planning: "info",
  confirmed: "success",
  in_progress: "warning",
  completed: "success",
  cancelled: "secondary",
};

// Demo fallback
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
    currency: "INR",
    description: "Traditional Telugu wedding with all functions",
  },
  {
    id: "2",
    title: "TechCorp Annual Day",
    type: "corporate",
    date: "2026-12-20",
    location: "Bengaluru",
    guest_count: 180,
    total_budget: 800000,
    total_expenses: 260000,
    status: "in_progress",
    task_completion: 68,
    currency: "INR",
    description: "Annual celebration with awards and entertainment",
  },
  {
    id: "3",
    title: "Rahul 30th Birthday",
    type: "birthday",
    date: "2026-11-28",
    location: "Mumbai",
    guest_count: 45,
    total_budget: 100000,
    total_expenses: 0,
    status: "draft",
    task_completion: 10,
    currency: "INR",
    description: "Surprise party with outdoor theme",
  },
];

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list({ limit: 20 }),
  });

  const events = (data?.items ?? DEMO_EVENTS) as unknown as (Event & { task_completion?: number })[];

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Events</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {events.length} event{events.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/events/new">
          <Button variant="gradient">
            <Plus className="w-4 h-4" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none w-full placeholder:text-slate-400"
            aria-label="Search events"
          />
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="planning">Planning</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Events grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No events found
          </h3>
          <p className="text-slate-500 mb-6">
            {search ? "Try a different search term" : "Create your first event to get started"}
          </p>
          <Link href="/events/new">
            <Button variant="gradient">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((event) => {
            const cat = EVENT_CATEGORIES.find((c) => c.id === event.type);
            const budgetPct = calculateBudgetProgress(
              event.total_expenses || 0,
              event.total_budget
            );
            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card hover className="h-full">
                  <CardContent className="p-0">
                    {/* Card header gradient */}
                    <div className={`event-card-${event.type} p-5 rounded-t-xl`}>
                      <div className="flex items-start justify-between">
                        <div className="text-3xl">{cat?.emoji || "📅"}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={STATUS_COLORS[event.status] || "secondary"}>
                            {event.status.replace("_", " ")}
                          </Badge>
                          <button
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="Event options"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-3">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {cat?.label}
                      </p>
                    </div>

                    {/* Card body */}
                    <div className="p-5 bg-white dark:bg-slate-900 rounded-b-xl space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <div className="flex justify-center mb-1">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {formatDate(event.date)}
                          </div>
                          <div className="text-slate-500">{formatRelativeDate(event.date)}</div>
                        </div>
                        <div>
                          <div className="flex justify-center mb-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {event.guest_count}
                          </div>
                          <div className="text-slate-500">Guests</div>
                        </div>
                        <div>
                          <div className="flex justify-center mb-1">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {formatCurrency(event.total_budget / 100000)}L
                          </div>
                          <div className="text-slate-500">Budget</div>
                        </div>
                      </div>

                      {/* Budget progress */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                          <span>Budget Used</span>
                          <span className="font-medium">{budgetPct}%</span>
                        </div>
                        <Progress value={budgetPct} className="h-1.5" />
                      </div>

                      {/* Task progress */}
                      {event.task_completion !== undefined && (
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                            <span>Tasks Complete</span>
                            <span className="font-medium">{event.task_completion}%</span>
                          </div>
                          <Progress
                            value={event.task_completion}
                            className="h-1.5"
                            indicatorClassName="bg-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Create new card */}
          <Link href="/events/new">
            <div className="h-full min-h-[280px] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 transition-colors flex flex-col items-center justify-center gap-3 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-900 transition-colors">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-violet-600 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                  Create New Event
                </p>
                <p className="text-xs text-slate-400 mt-0.5">AI-powered planning</p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
