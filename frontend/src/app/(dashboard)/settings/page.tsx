"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { User, Bell, Shield, CreditCard } from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().optional(),
  currency: z.string().min(1),
  language: z.string().min(1),
});

type ProfileForm = z.infer<typeof profileSchema>;

const SETTINGS_TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.full_name || "",
      email: user?.email || "",
      currency: "INR",
      language: "en",
    },
  });

  const onSave = async () => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Profile updated successfully");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  activeTab === tab.id
                    ? "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg">
                      {user ? getInitials(user.full_name) : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-xs text-slate-500 mt-1">JPG or PNG, max 2MB</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                  <Input label="Full Name" {...register("fullName")} />
                  <Input type="email" label="Email" {...register("email")} />
                  <Input label="Phone (optional)" placeholder="+91 99999 99999" {...register("phone")} />
                  <Input label="City (optional)" placeholder="Mumbai, Bengaluru..." {...register("city")} />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Preferred Currency
                      </label>
                      <Select defaultValue="INR">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">₹ INR</SelectItem>
                          <SelectItem value="USD">$ USD</SelectItem>
                          <SelectItem value="EUR">€ EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Language
                      </label>
                      <Select defaultValue="en">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="te">Telugu</SelectItem>
                          <SelectItem value="gu">Gujarati</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" variant="gradient" loading={isSubmitting}>
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  {["Event reminders", "Budget alerts", "RSVP updates", "Vendor responses", "Task deadlines"].map((pref) => (
                    <div key={pref} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span>{pref}</span>
                      <input type="checkbox" defaultChecked className="rounded text-violet-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Security Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300">
                  <p className="font-medium mb-1">Change Password</p>
                  <p className="text-slate-500 text-xs mb-3">Password must be at least 8 characters with uppercase and a number.</p>
                  <Button variant="outline" size="sm">Update Password</Button>
                </div>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm">
                  <p className="font-medium text-red-700 dark:text-red-400 mb-1">Delete Account</p>
                  <p className="text-red-600 dark:text-red-500 text-xs mb-3">This will permanently delete all your events and data.</p>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "billing" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Billing & Subscription</CardTitle></CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-violet-700 dark:text-violet-300">Starter Plan</p>
                      <p className="text-xs text-violet-600 dark:text-violet-400">Free forever · 2 events</p>
                    </div>
                    <Button variant="gradient" size="sm">Upgrade to Pro</Button>
                  </div>
                </div>
                <p className="text-sm text-slate-500">Upgrade to Pro for unlimited events, advanced AI planning, and priority support.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
