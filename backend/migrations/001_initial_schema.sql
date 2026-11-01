-- ============================================================
-- EventVerse AI – Initial Database Schema
-- Migration: 001_initial_schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- For vector search (requires pgvector extension)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- ── Enums ────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM (
    'guest', 'event_owner', 'co_organizer', 'vendor', 'volunteer', 'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE event_status_enum AS ENUM (
    'draft', 'planning', 'confirmed', 'in_progress', 'completed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_status_enum AS ENUM (
    'pending', 'in_progress', 'completed', 'overdue'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE expense_status_enum AS ENUM (
    'pending', 'paid', 'disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Users ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'event_owner',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  google_id VARCHAR(255),
  avatar_url VARCHAR(1024),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  preferred_currency VARCHAR(10) DEFAULT 'INR',
  preferred_language VARCHAR(20) DEFAULT 'en',
  bio TEXT
);

-- ── Events ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  status event_status_enum NOT NULL DEFAULT 'draft',
  date DATE NOT NULL,
  end_date DATE,
  location VARCHAR(255) NOT NULL,
  venue_type VARCHAR(100) NOT NULL DEFAULT 'tbd',
  guest_count INTEGER NOT NULL DEFAULT 0,
  total_budget NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  theme VARCHAR(255),
  cover_image VARCHAR(1024),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_events_owner ON events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- ── Event Tasks ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  status task_status_enum NOT NULL DEFAULT 'pending',
  due_date DATE,
  assigned_to UUID,
  priority INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_event ON event_tasks(event_id);

-- ── Budgets ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  total_budget NUMERIC(15,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  contingency_percentage NUMERIC(5,2) NOT NULL DEFAULT 10.0,
  category_allocations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budgets_event ON budgets(event_id);

-- ── Expenses ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  expense_date TIMESTAMPTZ,
  vendor_id UUID,
  receipt_url VARCHAR(1024),
  status expense_status_enum NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_event ON expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_budget ON expenses(budget_id);

-- ── Vendors ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(512),
  rating NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  starting_price NUMERIC(15,2) NOT NULL DEFAULT 0.0,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  verified BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  avatar_url VARCHAR(1024),
  portfolio_images JSONB,
  tags JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating DESC);

CREATE TABLE IF NOT EXISTS vendor_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(15,2) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'per event'
);

CREATE TABLE IF NOT EXISTS vendor_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  event_id UUID NOT NULL REFERENCES events(id),
  requested_by UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(15,2),
  details TEXT,
  requirements TEXT,
  valid_until TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_event ON vendor_quotes(event_id);
CREATE INDEX IF NOT EXISTS idx_quotes_vendor ON vendor_quotes(vendor_id);

-- ── Guests ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  rsvp_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  dietary_preferences JSONB,
  plus_one BOOLEAN NOT NULL DEFAULT false,
  plus_one_name VARCHAR(255),
  group_name VARCHAR(100),
  notes TEXT,
  invitation_sent BOOLEAN NOT NULL DEFAULT false,
  checked_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guests_event ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp ON guests(rsvp_status);

-- ── AI Tables ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  event_id UUID,
  title VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON ai_conversations(user_id);

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  extracted_data JSONB,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON ai_messages(conversation_id);

CREATE TABLE IF NOT EXISTS ai_generated_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  concept TEXT,
  plan_data JSONB,
  is_active VARCHAR(5) NOT NULL DEFAULT 'true',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_event ON ai_generated_plans(event_id);

-- ── Audit Log ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
