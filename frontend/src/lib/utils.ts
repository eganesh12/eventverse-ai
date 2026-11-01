import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  if (diffDays < 365) return `In ${Math.ceil(diffDays / 30)} months`;
  return `In ${Math.ceil(diffDays / 365)} years`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateBudgetProgress(spent: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((spent / total) * 100), 100);
}

export function getBudgetStatusColor(percentage: number): string {
  if (percentage >= 90) return "text-red-500";
  if (percentage >= 75) return "text-amber-500";
  if (percentage >= 50) return "text-yellow-500";
  return "text-emerald-500";
}

export const EVENT_CATEGORIES = [
  { id: "wedding", label: "Wedding", emoji: "💍" },
  { id: "birthday", label: "Birthday Party", emoji: "🎂" },
  { id: "college", label: "College Event", emoji: "🎓" },
  { id: "community", label: "Community Gathering", emoji: "🏘️" },
  { id: "corporate", label: "Corporate Event", emoji: "💼" },
  { id: "cultural", label: "Cultural & Religious", emoji: "🎭" },
  { id: "charity", label: "Charity & Fundraising", emoji: "❤️" },
  { id: "conference", label: "Conference & Seminar", emoji: "🎤" },
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number]["id"];
