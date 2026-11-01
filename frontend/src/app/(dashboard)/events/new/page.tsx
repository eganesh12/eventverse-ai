"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { eventsApi } from "@/lib/api";
import { EVENT_CATEGORIES } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Event Type", description: "What kind of event are you planning?" },
  { id: 2, title: "Basic Details", description: "Name, description, and dates" },
  { id: 3, title: "Location & Venue", description: "Where will your event be held?" },
  { id: 4, title: "Guests & Budget", description: "Expected attendees and total budget" },
  { id: 5, title: "Theme & Services", description: "Style preferences and required services" },
  { id: 6, title: "Review & Create", description: "Confirm and let AI generate your plan" },
];

const SERVICES = [
  "Photography", "Videography", "Catering", "Decoration", "DJ / Music",
  "Lighting", "Transportation", "Accommodation", "Makeup & Styling",
  "Stage Setup", "Florist", "Event MC", "Security", "Live Streaming",
];

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Jain", "Halal", "Gluten-free", "Non-vegetarian",
];

const formSchema = z.object({
  type: z.string().min(1, "Please select an event type"),
  title: z.string().min(2, "Event name is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Event date is required"),
  end_date: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  venue_type: z.string().min(1, "Venue type is required"),
  guest_count: z.coerce.number().min(1, "At least 1 guest required"),
  total_budget: z.coerce.number().min(1, "Budget is required"),
  currency: z.string().min(1),
  theme: z.string().optional(),
  services: z.array(z.string()).optional(),
  dietary: z.array(z.string()).optional(),
  special_requirements: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "INR",
      services: [],
      dietary: [],
    },
  });

  const watchedType = watch("type");
  const watchedValues = watch();

  const toggleService = (service: string) => {
    const updated = selectedServices.includes(service)
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service];
    setSelectedServices(updated);
    setValue("services", updated);
  };

  const toggleDietary = (diet: string) => {
    const updated = selectedDietary.includes(diet)
      ? selectedDietary.filter((d) => d !== diet)
      : [...selectedDietary, diet];
    setSelectedDietary(updated);
    setValue("dietary", updated);
  };

  const onSubmit = async (data: FormData) => {
    setIsCreating(true);
    try {
      const event = await eventsApi.create({
        ...data,
        status: "planning",
        theme: data.theme,
        cover_image: undefined,
      } as Parameters<typeof eventsApi.create>[0]);
      toast.success("Event created! AI is generating your plan...");
      router.push(`/events/${event.id}`);
    } catch {
      toast.error("Failed to create event. Please try again.");
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!watchedValues.type;
      case 2: return !!watchedValues.title && !!watchedValues.date;
      case 3: return !!watchedValues.location && !!watchedValues.venue_type;
      case 4: return !!watchedValues.guest_count && !!watchedValues.total_budget;
      default: return true;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Create New Event
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Step {step} of {STEPS.length}: {STEPS[step - 1].description}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, index) => (
          <div key={s.id} className="flex items-center shrink-0">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                step === s.id
                  ? "bg-violet-600 text-white ring-4 ring-violet-100 dark:ring-violet-900"
                  : step > s.id
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              )}
            >
              {step > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 sm:w-16 mx-1 transition-all",
                  step > s.id ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Event Type */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>What type of event are you planning?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EVENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setValue("type", cat.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-center transition-all hover:shadow-md",
                      watchedType === cat.id
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950"
                        : "border-slate-200 dark:border-slate-700 hover:border-violet-300"
                    )}
                  >
                    <div className="text-3xl mb-2">{cat.emoji}</div>
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {cat.label}
                    </div>
                  </button>
                ))}
              </div>
              {errors.type && (
                <p className="text-xs text-red-500 mt-3">{errors.type.message}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Basic Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Event Name"
                placeholder="e.g., Sharma Wedding 2027"
                {...register("title")}
                error={errors.title?.message}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Describe your event in detail..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Event Date"
                  {...register("date")}
                  error={errors.date?.message}
                />
                <Input
                  type="date"
                  label="End Date (optional)"
                  {...register("end_date")}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Location & Venue */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Location & Venue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="City / Location"
                placeholder="e.g., Hyderabad, Telangana"
                {...register("location")}
                error={errors.location?.message}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Venue Type
                </label>
                <Select onValueChange={(v) => setValue("venue_type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outdoor">Outdoor / Garden</SelectItem>
                    <SelectItem value="banquet_hall">Banquet Hall</SelectItem>
                    <SelectItem value="hotel">Hotel Venue</SelectItem>
                    <SelectItem value="resort">Resort / Destination</SelectItem>
                    <SelectItem value="conference_center">Conference Center</SelectItem>
                    <SelectItem value="beach">Beach / Waterfront</SelectItem>
                    <SelectItem value="rooftop">Rooftop</SelectItem>
                    <SelectItem value="home">Home / Private</SelectItem>
                    <SelectItem value="auditorium">Auditorium</SelectItem>
                    <SelectItem value="tbd">Not decided yet</SelectItem>
                  </SelectContent>
                </Select>
                {errors.venue_type && (
                  <p className="text-xs text-red-500 mt-1">{errors.venue_type.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Guests & Budget */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Guests & Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="number"
                label="Expected Number of Guests"
                placeholder="e.g., 300"
                {...register("guest_count")}
                error={errors.guest_count?.message}
              />
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input
                    type="number"
                    label="Total Budget"
                    placeholder="e.g., 1500000"
                    {...register("total_budget")}
                    error={errors.total_budget?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Currency
                  </label>
                  <Select defaultValue="INR" onValueChange={(v) => setValue("currency", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ INR</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                      <SelectItem value="GBP">£ GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {watchedValues.total_budget && watchedValues.guest_count && (
                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-sm text-violet-700 dark:text-violet-300">
                  💡 That&apos;s approximately{" "}
                  <strong>
                    ₹{Math.round(Number(watchedValues.total_budget) / Number(watchedValues.guest_count)).toLocaleString("en-IN")}
                  </strong>{" "}
                  per guest.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 5: Theme & Services */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Theme & Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Input
                label="Theme / Style (optional)"
                placeholder="e.g., Royal, Rustic, Modern Minimalist, Traditional..."
                {...register("theme")}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Required Services
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map((service) => (
                    <Badge
                      key={service}
                      variant={selectedServices.includes(service) ? "default" : "outline"}
                      className="cursor-pointer select-none"
                      onClick={() => toggleService(service)}
                    >
                      {selectedServices.includes(service) && "✓ "}
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Dietary Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((diet) => (
                    <Badge
                      key={diet}
                      variant={selectedDietary.includes(diet) ? "success" : "outline"}
                      className="cursor-pointer select-none"
                      onClick={() => toggleDietary(diet)}
                    >
                      {selectedDietary.includes(diet) && "✓ "}
                      {diet}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Special Requirements (optional)
                </label>
                <textarea
                  {...register("special_requirements")}
                  placeholder="Any specific requirements, accessibility needs, cultural considerations..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                Review & Create
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                {[
                  { label: "Event Type", value: EVENT_CATEGORIES.find((c) => c.id === watchedValues.type)?.label },
                  { label: "Event Name", value: watchedValues.title },
                  { label: "Date", value: watchedValues.date },
                  { label: "Location", value: watchedValues.location },
                  { label: "Guests", value: watchedValues.guest_count?.toString() },
                  { label: "Budget", value: `${watchedValues.currency} ${Number(watchedValues.total_budget).toLocaleString("en-IN")}` },
                  { label: "Theme", value: watchedValues.theme || "To be determined" },
                  { label: "Services", value: selectedServices.join(", ") || "None selected" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{label}</span>
                    <span className="font-medium text-slate-900 dark:text-white text-right max-w-[60%]">
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
                <p className="text-sm text-violet-700 dark:text-violet-300 font-medium mb-1">
                  ✨ What happens next
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  After you create this event, our AI planning engine will automatically generate
                  a complete event plan including budget breakdown, preparation timeline, vendor
                  checklist, and risk assessment — all tailored to your specifications.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {step < STEPS.length ? (
            <Button
              type="button"
              variant="gradient"
              onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="gradient"
              loading={isCreating}
            >
              <Sparkles className="w-4 h-4" />
              Create Event & Generate Plan
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
