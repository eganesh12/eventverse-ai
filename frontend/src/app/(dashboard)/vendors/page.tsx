"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { vendorApi, Vendor } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Star, MapPin, IndianRupee, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const VENDOR_CATEGORIES = [
  { id: "all", label: "All", emoji: "🔍" },
  { id: "venue", label: "Venues", emoji: "🏛️" },
  { id: "caterer", label: "Caterers", emoji: "🍽️" },
  { id: "photographer", label: "Photographers", emoji: "📸" },
  { id: "decorator", label: "Decorators", emoji: "🌸" },
  { id: "dj", label: "DJs & Music", emoji: "🎵" },
  { id: "makeup", label: "Makeup", emoji: "💄" },
  { id: "transport", label: "Transport", emoji: "🚌" },
];

// Demo vendors
const DEMO_VENDORS: Vendor[] = [
  {
    id: "v1",
    business_name: "Shree Palace Banquets",
    category: "venue",
    description: "Premium outdoor and indoor banquet venue in Hyderabad with capacity for 500+ guests. Fully air-conditioned halls with mandap setup services.",
    location: "Banjara Hills, Hyderabad",
    city: "Hyderabad",
    rating: 4.8,
    review_count: 124,
    starting_price: 200000,
    currency: "INR",
    verified: true,
    avatar_url: undefined,
    portfolio_images: [],
    services: [],
  },
  {
    id: "v2",
    business_name: "Hyderabad Caterers Co.",
    category: "caterer",
    description: "Specialist in South Indian vegetarian and Hyderabadi cuisine. Serving weddings and corporate events since 2005. GST compliant invoicing.",
    location: "Secunderabad, Hyderabad",
    city: "Hyderabad",
    rating: 4.6,
    review_count: 89,
    starting_price: 800,
    currency: "INR",
    verified: true,
    avatar_url: undefined,
    portfolio_images: [],
    services: [],
  },
  {
    id: "v3",
    business_name: "Clicks by Ravi Photography",
    category: "photographer",
    description: "Award-winning wedding photographer with 10+ years experience. Specializes in candid, traditional, and cinematic wedding photography.",
    location: "Jubilee Hills, Hyderabad",
    city: "Hyderabad",
    rating: 4.9,
    review_count: 203,
    starting_price: 75000,
    currency: "INR",
    verified: true,
    avatar_url: undefined,
    portfolio_images: [],
    services: [],
  },
  {
    id: "v4",
    business_name: "Bloom & Petal Decorators",
    category: "decorator",
    description: "Luxury floral and decoration specialists. From traditional marigold setups to modern minimalist designs. Theme customization available.",
    location: "Madhapur, Hyderabad",
    city: "Hyderabad",
    rating: 4.7,
    review_count: 67,
    starting_price: 50000,
    currency: "INR",
    verified: false,
    avatar_url: undefined,
    portfolio_images: [],
    services: [],
  },
  {
    id: "v5",
    business_name: "DJ Arjun Events",
    category: "dj",
    description: "Professional DJ and sound system for weddings and events. Bollywood, regional, and international music. Available pan-Hyderabad.",
    location: "Ameerpet, Hyderabad",
    city: "Hyderabad",
    rating: 4.5,
    review_count: 45,
    starting_price: 25000,
    currency: "INR",
    verified: true,
    avatar_url: undefined,
    portfolio_images: [],
    services: [],
  },
  {
    id: "v6",
    business_name: "Elegance Makeup Studio",
    category: "makeup",
    description: "Bridal and event makeup artists. Specializing in traditional Telugu bridal looks, airbrush makeup, and pre-wedding shoots.",
    location: "Kukatpally, Hyderabad",
    city: "Hyderabad",
    rating: 4.8,
    review_count: 156,
    starting_price: 15000,
    currency: "INR",
    verified: true,
    avatar_url: undefined,
    portfolio_images: [],
    services: [],
  },
];

function VendorCard({ vendor }: { vendor: Vendor }) {
  const handleRequestQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info("Quote request feature available after selecting an event. Go to Events → Vendors.");
  };

  return (
    <Card hover>
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 flex items-center justify-center text-2xl shrink-0">
            {VENDOR_CATEGORIES.find((c) => c.id === vendor.category)?.emoji || "🏢"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {vendor.business_name}
              </h3>
              {vendor.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" aria-label="Verified vendor" />
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {vendor.rating}
              </span>
              <span className="text-xs text-slate-400">({vendor.review_count} reviews)</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
          {vendor.description}
        </p>

        <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {vendor.location}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
              <IndianRupee className="w-3.5 h-3.5" />
              {(vendor.starting_price).toLocaleString("en-IN")}
              <span className="text-xs font-normal text-slate-500 ml-0.5">
                {vendor.category === "caterer" ? "/plate" : "onwards"}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {vendor.verified ? "✓ Verified" : "Unverified"} ·{" "}
              {VENDOR_CATEGORIES.find((c) => c.id === vendor.category)?.label}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleRequestQuote}>
            Request Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data } = useQuery({
    queryKey: ["vendors", activeCategory, search],
    queryFn: () =>
      vendorApi.list({
        category: activeCategory !== "all" ? activeCategory : undefined,
      }),
  });

  const vendors: Vendor[] = data?.items ?? DEMO_VENDORS;

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      v.business_name.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || v.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendor Marketplace</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Discover and connect with verified event vendors in your area.
        </p>
        <div className="inline-flex items-center gap-1.5 mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          <span>⚠️</span>
          <span>
            Demo vendor data — ratings, prices, and availability are illustrative only
          </span>
        </div>
      </div>

      {/* Search + filter row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search vendors by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none w-full placeholder:text-slate-400"
            aria-label="Search vendors"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {VENDOR_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-300"
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Vendors grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No vendors found
          </h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}
