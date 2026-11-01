-- ============================================================
-- EventVerse AI – Demo Seed Data
-- Migration: 002_seed_demo_data
-- ⚠️ DEMO DATA ONLY — not real vendors, ratings, or prices
-- ============================================================

-- Demo user (password: Demo@1234)
INSERT INTO users (id, email, hashed_password, full_name, role, is_active, is_verified)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@eventverse.ai',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGc4.mFNwpBp5.4dJz9M0.QjTLm',
  'Demo User',
  'event_owner',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- Demo vendor data
-- ⚠️ These are illustrative records. Ratings and prices are fictional.

INSERT INTO vendors (id, business_name, category, description, location, city, state, rating, review_count, starting_price, currency, verified)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Shree Palace Banquets', 'venue',
   'Premium banquet venue in Hyderabad with capacity for 500+ guests. Outdoor garden and AC halls available.',
   'Banjara Hills, Hyderabad', 'Hyderabad', 'Telangana', 4.8, 124, 200000, 'INR', true),

  ('10000000-0000-0000-0000-000000000002', 'Hyderabad Caterers Co.', 'caterer',
   'South Indian vegetarian and Hyderabadi cuisine specialists. GST compliant invoicing.',
   'Secunderabad, Hyderabad', 'Hyderabad', 'Telangana', 4.6, 89, 800, 'INR', true),

  ('10000000-0000-0000-0000-000000000003', 'Clicks by Ravi Photography', 'photographer',
   'Award-winning wedding photographer. Candid and traditional styles. Portfolio available on request.',
   'Jubilee Hills, Hyderabad', 'Hyderabad', 'Telangana', 4.9, 203, 75000, 'INR', true),

  ('10000000-0000-0000-0000-000000000004', 'Bloom & Petal Decorators', 'decorator',
   'Floral and theme decoration for weddings and corporate events. Traditional and modern styles.',
   'Madhapur, Hyderabad', 'Hyderabad', 'Telangana', 4.7, 67, 50000, 'INR', false),

  ('10000000-0000-0000-0000-000000000005', 'DJ Arjun Events', 'dj',
   'Professional DJ and sound systems for weddings and events. Bollywood, regional, and international music.',
   'Ameerpet, Hyderabad', 'Hyderabad', 'Telangana', 4.5, 45, 25000, 'INR', true),

  ('10000000-0000-0000-0000-000000000006', 'Elegance Makeup Studio', 'makeup',
   'Bridal and event makeup. Traditional Telugu bridal looks and airbrush makeup.',
   'Kukatpally, Hyderabad', 'Hyderabad', 'Telangana', 4.8, 156, 15000, 'INR', true),

  -- Mumbai vendors
  ('10000000-0000-0000-0000-000000000007', 'The Grand Mumbai Venue', 'venue',
   'Luxury banquet and conference venue in Mumbai with sea-facing terrace.',
   'Worli, Mumbai', 'Mumbai', 'Maharashtra', 4.7, 98, 350000, 'INR', true),

  ('10000000-0000-0000-0000-000000000008', 'Bombay Bites Catering', 'caterer',
   'Multi-cuisine catering for corporate and social events. Min 50 plates.',
   'Andheri, Mumbai', 'Mumbai', 'Maharashtra', 4.5, 72, 1200, 'INR', true),

  -- Bengaluru vendors
  ('10000000-0000-0000-0000-000000000009', 'Bengaluru Convention Center', 'venue',
   'Modern conference and banquet facility. AV-ready halls for 50–1000 guests.',
   'Whitefield, Bengaluru', 'Bengaluru', 'Karnataka', 4.6, 115, 150000, 'INR', true),

  ('10000000-0000-0000-0000-000000000010', 'Frame by Frame Studios', 'photographer',
   'Corporate and event photography. Drone photography available.',
   'Koramangala, Bengaluru', 'Bengaluru', 'Karnataka', 4.8, 88, 50000, 'INR', true)
ON CONFLICT DO NOTHING;

-- Vendor services
INSERT INTO vendor_services (id, vendor_id, name, description, price, unit)
VALUES
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'Full Day Banquet Hall', 'AC hall for 500 guests, 8 hours', 200000, 'per day'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'Garden Lawn', 'Outdoor lawn for 800 guests', 150000, 'per day'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000002', 'South Indian Veg Thali', 'Full wedding thali with sweets', 800, 'per plate'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000002', 'Hyderabadi Biryani Setup', 'Biryani + sides for wedding', 600, 'per plate'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'Wedding Photography Package', '8 hours + 500 edited photos', 75000, 'per event'),
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'Cinematic Video + Photo Combo', 'Full film + photography', 150000, 'per event')
ON CONFLICT DO NOTHING;
