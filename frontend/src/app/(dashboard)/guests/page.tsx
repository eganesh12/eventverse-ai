"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Upload, Mail, Users, CheckCircle, XCircle, Clock } from "lucide-react";

const DEMO_GUESTS = [
  { id: "1", name: "Arjun Reddy", email: "arjun@example.com", rsvp: "confirmed", group: "Family", dietary: ["Vegetarian"], plus_one: true },
  { id: "2", name: "Priya Patel", email: "priya@example.com", rsvp: "confirmed", group: "Friends", dietary: ["Jain"], plus_one: false },
  { id: "3", name: "Rahul Verma", email: "rahul@example.com", rsvp: "pending", group: "Colleagues", dietary: [], plus_one: false },
  { id: "4", name: "Sneha Nair", email: "sneha@example.com", rsvp: "declined", group: "Family", dietary: ["Vegan"], plus_one: false },
  { id: "5", name: "Vikram Singh", email: "vikram@example.com", rsvp: "maybe", group: "Friends", dietary: ["Non-veg"], plus_one: true },
  { id: "6", name: "Meera Iyer", email: "meera@example.com", rsvp: "confirmed", group: "Family", dietary: ["Vegetarian"], plus_one: false },
];

const RSVP_COLORS: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  confirmed: "success",
  pending: "warning",
  declined: "destructive",
  maybe: "secondary",
};

export default function GuestsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = DEMO_GUESTS.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || g.rsvp === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: DEMO_GUESTS.length,
    confirmed: DEMO_GUESTS.filter(g => g.rsvp === "confirmed").length,
    declined: DEMO_GUESTS.filter(g => g.rsvp === "declined").length,
    pending: DEMO_GUESTS.filter(g => g.rsvp === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guest Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{stats.total} guests · {stats.confirmed} confirmed</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4" />
            Send Invitations
          </Button>
          <Button variant="gradient" size="sm">
            <Plus className="w-4 h-4" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* RSVP stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Invited", value: stats.total, icon: Users, color: "text-violet-600 bg-violet-50" },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
          { label: "Declined", value: stats.declined, icon: XCircle, color: "text-red-500 bg-red-50" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RSVP Progress */}
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">RSVP Progress</span>
            <span className="font-medium">{Math.round((stats.confirmed / stats.total) * 100)}% responded positively</span>
          </div>
          <Progress value={(stats.confirmed / stats.total) * 100} className="h-3" />
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none w-full placeholder:text-slate-400"
            aria-label="Search guests"
          />
        </div>
        {["all", "confirmed", "pending", "declined", "maybe"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-violet-600 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Guest table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Guest</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Group</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dietary</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">+1</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">RSVP</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filtered.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{guest.name}</div>
                      <div className="text-xs text-slate-500">{guest.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 dark:text-slate-400">{guest.group}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {guest.dietary.map((d) => (
                          <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                        ))}
                        {guest.dietary.length === 0 && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={guest.plus_one ? "text-emerald-600" : "text-slate-400"}>
                        {guest.plus_one ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={RSVP_COLORS[guest.rsvp] || "secondary"}>
                        {guest.rsvp}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
