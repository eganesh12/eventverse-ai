const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(
      response.status,
      error.detail || error.message || "Request failed",
      error
    );
  }
  return response.json();
}

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  get: async <T>(path: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(response);
  },

  post: async <T>(path: string, body?: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(path: string, body?: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  put: async <T>(path: string, body?: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(path: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(response);
  },
};

// Auth endpoints
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    full_name: string;
  }) => api.post("/api/v1/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<{ access_token: string; token_type: string; user: User }>(
      "/api/v1/auth/login",
      data
    ),

  getMe: () => api.get<User>("/api/v1/auth/me"),

  refreshToken: () => api.post<{ access_token: string }>("/api/v1/auth/refresh"),
};

// Events endpoints
export const eventsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Event>>(
      `/api/v1/events?page=${params?.page || 1}&limit=${params?.limit || 10}`
    ),

  get: (id: string) => api.get<Event>(`/api/v1/events/${id}`),

  create: (data: CreateEventPayload) => api.post<Event>("/api/v1/events", data),

  update: (id: string, data: Partial<CreateEventPayload>) =>
    api.patch<Event>(`/api/v1/events/${id}`, data),

  delete: (id: string) => api.delete(`/api/v1/events/${id}`),
};

// AI endpoints
export const aiApi = {
  chat: (data: { conversation_id?: string; message: string; event_id?: string }) =>
    api.post<AIChatResponse>("/api/v1/ai/chat", data),

  generatePlan: (data: { event_id: string; requirements?: string }) =>
    api.post<EventPlan>("/api/v1/ai/generate-plan", data),

  revisePlan: (data: { event_id: string; change_request: string }) =>
    api.post<EventPlan>("/api/v1/ai/revise-plan", data),

  generateTheme: (data: { event_id: string; style_preferences?: string }) =>
    api.post("/api/v1/ai/generate-theme", data),

  generateTimeline: (data: { event_id: string }) =>
    api.post("/api/v1/ai/generate-timeline", data),
};

// Budget endpoints
export const budgetApi = {
  get: (eventId: string) => api.get<Budget>(`/api/v1/events/${eventId}/budget`),

  addExpense: (eventId: string, data: CreateExpensePayload) =>
    api.post<Expense>(`/api/v1/events/${eventId}/expenses`, data),

  updateBudget: (eventId: string, data: Partial<Budget>) =>
    api.patch<Budget>(`/api/v1/events/${eventId}/budget`, data),
};

// Vendor endpoints
export const vendorApi = {
  list: (params?: {
    category?: string;
    location?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
  }) => {
    const query = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])
    ).toString();
    return api.get<PaginatedResponse<Vendor>>(`/api/v1/vendors?${query}`);
  },

  get: (id: string) => api.get<Vendor>(`/api/v1/vendors/${id}`),

  requestQuote: (data: {
    vendor_id: string;
    event_id: string;
    requirements?: string;
  }) => api.post<VendorQuote>("/api/v1/vendor-quotes", data),

  createBooking: (data: {
    vendor_id: string;
    event_id: string;
    quote_id?: string;
  }) => api.post<VendorBooking>("/api/v1/vendor-bookings", data),
};

// Guests endpoints
export const guestApi = {
  list: (eventId: string) =>
    api.get<Guest[]>(`/api/v1/events/${eventId}/guests`),

  add: (eventId: string, data: CreateGuestPayload) =>
    api.post<Guest>(`/api/v1/events/${eventId}/guests`, data),

  updateRsvp: (guestId: string, status: string) =>
    api.patch<Guest>(`/api/v1/guests/${guestId}/rsvp`, { status }),
};

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "guest" | "event_owner" | "co_organizer" | "vendor" | "volunteer" | "admin";
  avatar_url?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  type: string;
  description?: string;
  date: string;
  end_date?: string;
  location: string;
  venue_type: string;
  guest_count: number;
  total_budget: number;
  currency: string;
  status: "draft" | "planning" | "confirmed" | "in_progress" | "completed" | "cancelled";
  theme?: string;
  cover_image?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  // Aggregated fields
  total_expenses?: number;
  task_completion?: number;
  vendor_count?: number;
  guest_rsvp_count?: number;
}

export interface EventPlan {
  id: string;
  event_id: string;
  version: number;
  concept: string;
  theme_suggestions: ThemeSuggestion[];
  budget_breakdown: BudgetCategory[];
  timeline: TimelineItem[];
  vendor_checklist: VendorChecklistItem[];
  risk_assessment: RiskItem[];
  created_at: string;
}

export interface ThemeSuggestion {
  name: string;
  description: string;
  color_palette: string[];
  style_keywords: string[];
}

export interface BudgetCategory {
  category: string;
  estimated_amount: number;
  percentage: number;
  items: { name: string; estimated_cost: number }[];
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  category: string;
  dependencies?: string[];
}

export interface VendorChecklistItem {
  category: string;
  required: boolean;
  status: "not_started" | "researching" | "quoted" | "booked";
  notes?: string;
}

export interface RiskItem {
  title: string;
  severity: "low" | "medium" | "high";
  probability: string;
  mitigation: string;
}

export interface Budget {
  id: string;
  event_id: string;
  total_budget: number;
  currency: string;
  categories: BudgetCategory[];
  total_estimated: number;
  total_actual: number;
  remaining: number;
  contingency_percentage: number;
}

export interface Expense {
  id: string;
  event_id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor_id?: string;
  receipt_url?: string;
  status: "pending" | "paid" | "disputed";
}

export interface Vendor {
  id: string;
  business_name: string;
  category: string;
  description: string;
  location: string;
  city: string;
  rating: number;
  review_count: number;
  starting_price: number;
  currency: string;
  verified: boolean;
  avatar_url?: string;
  portfolio_images: string[];
  services: VendorService[];
}

export interface VendorService {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
}

export interface VendorQuote {
  id: string;
  vendor_id: string;
  event_id: string;
  amount: number;
  details: string;
  valid_until: string;
  status: "pending" | "received" | "accepted" | "rejected";
}

export interface VendorBooking {
  id: string;
  vendor_id: string;
  event_id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  amount: number;
  notes?: string;
}

export interface Guest {
  id: string;
  event_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  rsvp_status: "pending" | "confirmed" | "declined" | "maybe";
  dietary_preferences?: string[];
  plus_one: boolean;
  group?: string;
  notes?: string;
}

export interface AIChatResponse {
  conversation_id: string;
  message: string;
  role: "assistant";
  extracted_data?: Partial<Event>;
  suggestions?: string[];
  requires_clarification?: boolean;
  clarification_questions?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export type CreateEventPayload = Omit<Event, "id" | "owner_id" | "created_at" | "updated_at">;
export type CreateExpensePayload = Omit<Expense, "id" | "event_id">;
export type CreateGuestPayload = Omit<Guest, "id" | "event_id">;
