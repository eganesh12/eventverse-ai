"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const MONTHLY_DATA = [
  { month: "Jul", events: 0, budget: 0 },
  { month: "Aug", events: 1, budget: 100000 },
  { month: "Sep", events: 1, budget: 300000 },
  { month: "Oct", events: 2, budget: 650000 },
  { month: "Nov", events: 3, budget: 1200000 },
  { month: "Dec", events: 3, budget: 1800000 },
];

const EVENT_TYPE_DATA = [
  { name: "Wedding", value: 1, color: "#ec4899" },
  { name: "Corporate", value: 1, color: "#7c3aed" },
  { name: "Birthday", value: 1, color: "#f97316" },
];

const VENDOR_SPEND = [
  { vendor: "Venue", amount: 300000 },
  { vendor: "Catering", amount: 0 },
  { vendor: "Photo/Video", amount: 75000 },
  { vendor: "Decor", amount: 0 },
  { vendor: "Music", amount: 45000 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Event performance and spending insights.</p>
        <Badge variant="info" className="mt-2">Based on demo data</Badge>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: "3", change: "+3 this year" },
          { label: "Total Budget", value: "₹24L", change: "Across all events" },
          { label: "Total Guests", value: "537", change: "Combined guest count" },
          { label: "Completion Rate", value: "67%", change: "Task completion" },
        ].map(({ label, value, change }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Cumulative Budget Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="budget" stroke="#7c3aed" fill="url(#budgetGrad)" strokeWidth={2} name="Budget" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event types pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={EVENT_TYPE_DATA} cx="50%" cy="50%" outerRadius={65} dataKey="value">
                  {EVENT_TYPE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Vendor spend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendor Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={VENDOR_SPEND} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <YAxis dataKey="vendor" type="category" tick={{ fontSize: 11 }} width={70} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#7c3aed" radius={[0, 4, 4, 0]} name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
