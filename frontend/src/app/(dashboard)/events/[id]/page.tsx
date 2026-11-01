"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventsApi, aiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays, Users, DollarSign, MapPin, Sparkles,
  CheckSquare, ShoppingBag, AlertTriangle, RefreshCw,
  Edit, Share2, Download
} from "lucide-react";
import { formatCurrency, formatDate, calculateBudgetProgress, EVENT_CATEGORIES } from "@/lib/utils";
import { toast } from "sonner";

// Demo event for fallback
const DEMO_EVENT = {
  id: "1",
  title: "Sharma Wedding",
  type: "wedding",
  date: "2027-02-14",
  location: "Hyderabad, Telangana",
  venue_type: "outdoor",
  guest_count: 312,
  total_budget: 1500000,
  total_expenses: 420000,
  status: "planning",
  currency: "INR",
  description: "Traditional Telugu wedding with all functions — Mehendi, Haldi, Sangeet, Wedding ceremony, and Reception.",
  theme: "Royal Traditional",
  owner_id: "user-1",
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
};

const DEMO_PLAN = {
  concept: "A grand traditional Telugu wedding set in an outdoor garden venue in Hyderabad. The event will blend age-old customs with elegant modern touches — featuring a floral mandap, traditional dhol performers, and a vibrant Sangeet night.",
  budget_breakdown: [
    { category: "Venue", estimated_amount: 300000, percentage: 20 },
    { category: "Catering & Food", estimated_amount: 450000, percentage: 30 },
    { category: "Decoration & Florals", estimated_amount: 225000, percentage: 15 },
    { category: "Photography & Video", estimated_amount: 150000, percentage: 10 },
    { category: "Accommodation", estimated_amount: 120000, percentage: 8 },
    { category: "Makeup & Styling", estimated_amount: 75000, percentage: 5 },
    { category: "Music & Entertainment", estimated_amount: 90000, percentage: 6 },
    { category: "Contingency (6%)", estimated_amount: 90000, percentage: 6 },
  ],
  timeline: [
    { title: "Book venue", due_date: "2026-08-14", status: "completed", category: "Venue" },
    { title: "Finalize caterer and menu", due_date: "2026-10-14", status: "completed", category: "Catering" },
    { title: "Book photographer and videographer", due_date: "2026-09-14", status: "completed", category: "Photography" },
    { title: "Send wedding invitations", due_date: "2026-12-14", status: "in_progress", category: "Guests" },
    { title: "Book hotel room blocks", due_date: "2026-11-14", status: "in_progress", category: "Accommodation" },
    { title: "Finalize decoration theme", due_date: "2026-12-01", status: "pending", category: "Decoration" },
    { title: "Rehearsal dinner planning", due_date: "2027-01-14", status: "pending", category: "Events" },
    { title: "Final headcount confirmation", due_date: "2027-02-01", status: "pending", category: "Guests" },
  ],
  risks: [
    { title: "Weather risk for outdoor venue", severity: "high", mitigation: "Book covered backup venue" },
    { title: "Vendor last-minute cancellation", severity: "medium", mitigation: "Have 2 backup vendors per category" },
    { title: "Guest count increase beyond 312", severity: "low", mitigation: "Keep 10% buffer in catering quote" },
  ],
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-blue-100 text-blue-700",
  pending: "bg-slate-100 text-slate-600",
  overdue: "bg-red-100 text-red-700",
};

const RISK_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsApi.get(id),
  });

  const displayEvent = event ?? (DEMO_EVENT as unknown as typeof event);
  const plan = DEMO_PLAN;
  const cat = EVENT_CATEGORIES.find((c) => c.id === displayEvent?.type);
  const budgetPct = calculateBudgetProgress(
    (displayEvent as unknown as { total_expenses?: number })?.total_expenses || 0,
    displayEvent?.total_budget || 0
  );

  const handleGeneratePlan = async () => {
    if (!displayEvent?.id) return;
    setIsGenerating(true);
    try {
      await aiApi.generatePlan({ event_id: displayEvent.id });
      toast.success("AI plan generated successfully!");
    } catch {
      toast.error("AI service unavailable. Please configure your API keys.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!displayEvent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{cat?.emoji}</span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {displayEvent.title}
            </h1>
            <Badge variant="info">{displayEvent.status?.replace("_", " ")}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              {formatDate(displayEvent.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {displayEvent.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {displayEvent.guest_count} guests
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              {formatCurrency(displayEvent.total_budget)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleGeneratePlan}
            loading={isGenerating}
          >
            <Sparkles className="w-4 h-4" />
            Regenerate AI Plan
          </Button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Total Budget</p>
            <p className="text-xl font-bold text-violet-600">
              {formatCurrency(displayEvent.total_budget)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Spent So Far</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency((displayEvent as unknown as { total_expenses?: number }).total_expenses || 0)}
            </p>
            <Progress value={budgetPct} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Remaining</p>
            <p className="text-xl font-bold text-emerald-600">
              {formatCurrency(displayEvent.total_budget - ((displayEvent as unknown as { total_expenses?: number }).total_expenses || 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Tasks Done</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {plan.timeline.filter((t) => t.status === "completed").length}/{plan.timeline.length}
            </p>
            <Progress
              value={(plan.timeline.filter((t) => t.status === "completed").length / plan.timeline.length) * 100}
              className="mt-2 h-1.5"
              indicatorClassName="bg-emerald-500"
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  AI Event Concept
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {plan.concept}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Theme", value: displayEvent.theme || "Not specified" },
                  { label: "Venue Type", value: displayEvent.venue_type || "Not specified" },
                  { label: "Event Type", value: cat?.label || displayEvent.type },
                  { label: "Duration", value: "1 day" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Budget Breakdown</CardTitle>
                <Badge variant="warning">AI Estimate — Not Confirmed</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.budget_breakdown.map((item) => (
                  <div key={item.category} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.category}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {formatCurrency(item.estimated_amount)}
                          <span className="text-xs text-slate-400 ml-1">({item.percentage}%)</span>
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Total Estimated</span>
                <span className="font-bold text-violet-600">
                  {formatCurrency(plan.budget_breakdown.reduce((s, i) => s + i.estimated_amount, 0))}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Preparation Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.timeline.map((task, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 mt-0.5 ${STATUS_COLORS[task.status]}`}>
                      {task.status.replace("_", " ")}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {task.category} · Due {formatDate(task.due_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate Timeline
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Vendor Checklist
                </CardTitle>
                <Button variant="gradient" size="sm">
                  Browse Vendors
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["Venue", "Caterer", "Photographer", "Videographer", "Decorator", "Florist",
                  "Makeup Artist", "DJ / Band", "Transportation", "Accommodation"].map((vendor) => (
                  <div key={vendor} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{vendor}</span>
                    <Badge variant="secondary">Not Booked</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guests Tab */}
        <TabsContent value="guests" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Guest Management
                </CardTitle>
                <Button variant="gradient" size="sm">
                  Add Guests
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Invited", value: "312", color: "text-violet-600" },
                  { label: "Confirmed", value: "187", color: "text-emerald-600" },
                  { label: "Declined", value: "24", color: "text-red-500" },
                  { label: "Pending", value: "101", color: "text-amber-600" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 text-center">
                Import your guest list via CSV or add guests manually to track RSVPs and manage seating.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.risks.map((risk, index) => (
                <div key={index} className={`p-4 rounded-xl border ${RISK_COLORS[risk.severity]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">{risk.title}</h4>
                    <Badge
                      variant={risk.severity === "high" ? "destructive" : risk.severity === "medium" ? "warning" : "success"}
                    >
                      {risk.severity}
                    </Badge>
                  </div>
                  <p className="text-xs opacity-80">
                    <span className="font-medium">Mitigation: </span>
                    {risk.mitigation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
