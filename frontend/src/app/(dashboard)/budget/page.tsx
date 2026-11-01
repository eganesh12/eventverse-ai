"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, calculateBudgetProgress } from "@/lib/utils";
import {
  DollarSign, TrendingDown, TrendingUp, Plus, Download, AlertTriangle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const DEMO_BUDGETS = [
  {
    eventId: "1",
    eventName: "Sharma Wedding",
    totalBudget: 1500000,
    totalSpent: 420000,
    currency: "INR",
    categories: [
      { category: "Venue", allocated: 300000, spent: 300000, status: "paid" },
      { category: "Catering", allocated: 450000, spent: 0, status: "pending" },
      { category: "Photography", allocated: 150000, spent: 75000, status: "partial" },
      { category: "Decoration", allocated: 225000, spent: 0, status: "pending" },
      { category: "Music & Entertainment", allocated: 90000, spent: 45000, status: "partial" },
      { category: "Accommodation", allocated: 120000, spent: 0, status: "pending" },
      { category: "Makeup & Styling", allocated: 75000, spent: 0, status: "pending" },
      { category: "Contingency", allocated: 90000, spent: 0, status: "reserved" },
    ],
  },
];

const CHART_DATA = [
  { category: "Venue", allocated: 300000, spent: 300000 },
  { category: "Catering", allocated: 450000, spent: 0 },
  { category: "Photography", allocated: 150000, spent: 75000 },
  { category: "Decoration", allocated: 225000, spent: 0 },
  { category: "Music", allocated: 90000, spent: 45000 },
  { category: "Others", allocated: 285000, spent: 0 },
];

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  pending: "bg-slate-100 text-slate-600",
  reserved: "bg-blue-100 text-blue-700",
};

export default function BudgetPage() {
  const [selectedEvent, setSelectedEvent] = useState("1");
  const budget = DEMO_BUDGETS.find((b) => b.eventId === selectedEvent) || DEMO_BUDGETS[0];
  const remaining = budget.totalBudget - budget.totalSpent;
  const utilization = calculateBudgetProgress(budget.totalSpent, budget.totalBudget);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Budget Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track spending and manage allocations across your events.</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Sharma Wedding</SelectItem>
              <SelectItem value="2">TechCorp Annual Day</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="gradient" size="sm">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Budget", value: formatCurrency(budget.totalBudget), icon: DollarSign, color: "text-violet-600 bg-violet-50" },
          { label: "Spent", value: formatCurrency(budget.totalSpent), icon: TrendingDown, color: "text-red-500 bg-red-50" },
          { label: "Remaining", value: formatCurrency(remaining), icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
          { label: "Utilization", value: `${utilization}%`, icon: AlertTriangle, color: utilization > 75 ? "text-amber-600 bg-amber-50" : "text-slate-600 bg-slate-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allocated vs Spent by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={CHART_DATA} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
              <Legend />
              <Bar dataKey="allocated" name="Allocated" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Category Breakdown</CardTitle>
            <Badge variant="warning">AI estimates — not confirmed quotes</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budget.categories.map((cat) => {
              const pct = calculateBudgetProgress(cat.spent, cat.allocated);
              return (
                <div key={cat.category} className="flex items-center gap-4">
                  <div className="w-36 shrink-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {cat.category}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{formatCurrency(cat.spent)} spent</span>
                      <span>{formatCurrency(cat.allocated)} allocated</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[cat.status]}`}>
                    {cat.status}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
