-- ============================================================
-- Best Hotel Deals Daily — Full Backend Schema (Migration 002)
-- Adds: users, hotels, rooms, room_availability, bookings,
--       leads, affiliate_clicks
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ─── 1. USERS ────────────────────────────────────────────────────────────────
-- Extends auth.users with role, profile data, and preferences.
-- Created automatically on signup via API route (service role insert).
CREATE TABLE IF NOT EXISTS users (
  id           uuid         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text         NOT NULL UNIQUE,
  full_name    text,
  phone        text,
  role         text         NOT NULL DEFAULT 'customer'
                            CHECK (role IN ('customer', 'hotel_owner', 'admin')),
  avatar_url   text,
  nationality  text,
  created_at   timestamptz  DEFAULT now(),
  updated_at   timestamptz  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role       ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_email      ON users (email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read and update their own profile.
-- All writes go through service role via API routes.
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ─── 2. HOTELS ────────────────────────────────────────────────────────────────
-- DB-managed hotel listings submitted through the partner workflow.
-- Distinct from the static hotels in src/lib/data.ts.
-- listing_type drives CTA routing: affiliate → link, direct → book form, lead → WhatsApp.
CREATE TABLE IF NOT EXISTS hotels (
  id                   uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id             uuid         REFERENCES users(id) ON DELETE SET NULL,
  name                 text         NOT NULL,
  slug                 text         NOT NULL UNIQUE,
  description          text,
  short_description    text,
  city                 text         NOT NULL,
  country              text         NOT NULL,
  address              text,
  latitude             numeric(10,7),
  longitude            numeric(10,7),
  stars                smallint     CHECK (stars BETWEEN 1 AND 7),
  rating               numeric(3,1) CHECK (rating BETWEEN 0.0 AND 10.0),
  review_count         integer      DEFAULT 0,
  listing_type         text         NOT NULL DEFAULT 'affiliate'
                                   CHECK (listing_type IN ('affiliate', 'direct', 'lead')),
  status               text         NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'live')),
  hotel_type           text         CHECK (hotel_type IN ('luxury', 'budget', 'boutique', 'business', 'resort')),
  amenities            text[]       DEFAULT '{}',
  images               text[]       DEFAULT '{}',
  cover_image          text,
  price_from           numeric(10,2),
  currency             text         DEFAULT 'USD',
  -- Affiliate links stored as JSON: { booking, agoda, expedia }
  affiliate_links      jsonb        DEFAULT '{}',
  commission_rate      numeric(5,2) DEFAULT 10.00,
  check_in_time        text         DEFAULT '14:00',
  check_out_time       text         DEFAULT '12:00',
  cancellation_policy  text,
  -- Makkah/Madinah proximity filters
  near_haram           boolean      DEFAULT false,
  distance_from_haram  numeric(10,3),
  distance_from_center numeric(10,3),
  allow_inquiry        boolean      DEFAULT true,
  verified             boolean      DEFAULT false,
  featured             boolean      DEFAULT false,
  -- Admin workflow fields
  admin_notes          text,
  rejected_reason      text,
  reviewed_at          timestamptz,
  reviewed_by          text,
  created_at           timestamptz  DEFAULT now(),
  updated_at           timestamptz  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hotels_city          ON hotels (city);
CREATE INDEX IF NOT EXISTS idx_hotels_country       ON hotels (country);
CREATE INDEX IF NOT EXISTS idx_hotels_status        ON hotels (status);
CREATE INDEX IF NOT EXISTS idx_hotels_listing_type  ON hotels (listing_type);
CREATE INDEX IF NOT EXISTS idx_hotels_owner_id      ON hotels (owner_id);
CREATE INDEX IF NOT EXISTS idx_hotels_featured      ON hotels (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_hotels_near_haram    ON hotels (near_haram) WHERE near_haram = true;
CREATE INDEX IF NOT EXISTS idx_hotels_created_at    ON hotels (created_at DESC);

ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- Public can browse approved/live hotels
CREATE POLICY "Public can view live hotels"
  ON hotels FOR SELECT
  USING (status IN ('approved', 'live'));

-- Hotel owners can see their own listings (any status)
CREATE POLICY "Owners can view own hotels"
  ON hotels FOR SELECT
  USING (auth.uid() = owner_id);

-- ─── 3. ROOMS ────────────────────────────────────────────────────────────────
-- Rooms belong to direct-listing hotels. Price + availability power the booking form.
CREATE TABLE IF NOT EXISTS rooms (
  id              uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id        uuid         NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name            text         NOT NULL,
  description     text,
  room_type       text         NOT NULL
                               CHECK (room_type IN ('single', 'double', 'twin', 'suite', 'family', 'studio', 'penthouse')),
  price_per_night numeric(10,2) NOT NULL,
  currency        text         DEFAULT 'USD',
  max_guests      smallint     NOT NULL DEFAULT 2,
  bed_type        text,
  amenities       text[]       DEFAULT '{}',
  images          text[]       DEFAULT '{}',
  available       boolean      DEFAULT true,
  total_rooms     smallint     DEFAULT 1,
  created_at      timestamptz  DEFAULT now(),
  updated_at      timestamptz  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id   ON rooms (hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_available  ON rooms (available) WHERE available = true;

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Public can browse rooms of live hotels
CREATE POLICY "Public can view rooms of live hotels"
  ON rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hotels h
      WHERE h.id = hotel_id AND h.status IN ('approved', 'live')
    )
  );

-- ─── 4. ROOM AVAILABILITY ────────────────────────────────────────────────────
-- Per-date availability overrides. Allows hotel owners to block dates and
-- set dynamic pricing for specific dates.
CREATE TABLE IF NOT EXISTS room_availability (
  id              uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id         uuid         NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date            date         NOT NULL,
  available_count smallint     NOT NULL DEFAULT 0,
  price_override  numeric(10,2),
  created_at      timestamptz  DEFAULT now(),
  UNIQUE (room_id, date)
);

CREATE INDEX IF NOT EXISTS idx_room_avail_room_id ON room_availability (room_id);
CREATE INDEX IF NOT EXISTS idx_room_avail_date    ON room_availability (date);

ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view room availability"
  ON room_availability FOR SELECT
  USING (true);

-- ─── 5. BOOKINGS ─────────────────────────────────────────────────────────────
-- Full booking lifecycle for hotels with listing_type = 'direct'.
-- booking_ref is a human-readable reference for guest communication.
CREATE TABLE IF NOT EXISTS bookings (
  id              uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_ref     text         NOT NULL UNIQUE,          -- e.g. BK20260320A3F8C2
  -- Nullable user_id supports guest checkout (no account required)
  user_id         uuid         REFERENCES users(id) ON DELETE SET NULL,
  hotel_id        uuid         NOT NULL REFERENCES hotels(id) ON DELETE RESTRICT,
  room_id         uuid         NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  guest_name      text         NOT NULL,
  guest_email     text         NOT NULL,
  guest_phone     text,
  check_in        date         NOT NULL,
  check_out       date         NOT NULL,
  guests_count    smallint     NOT NULL DEFAULT 1,
  rooms_count     smallint     NOT NULL DEFAULT 1,
  price_per_night numeric(10,2) NOT NULL,
  total_amount    numeric(10,2) NOT NULL,
  currency        text         DEFAULT 'USD',
  status          text         NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'refunded')),
  special_requests text,
  payment_status  text         DEFAULT 'unpaid'
                               CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'partial')),
  payment_method  text,
  admin_notes     text,
  confirmed_at    timestamptz,
  cancelled_at    timestamptz,
  created_at      timestamptz  DEFAULT now(),
  updated_at      timestamptz  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id    ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id   ON bookings (hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id    ON bookings (room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status     ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in   ON bookings (check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_ref        ON bookings (booking_ref);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Guests can view their own bookings (by user_id or email match)
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- ─── 6. LEADS ────────────────────────────────────────────────────────────────
-- Guest inquiries for hotels that don't support direct booking.
-- Replaces and extends the existing booking_inquiries table.
-- These are forwarded to hotel partners via WhatsApp, email, or CRM.
CREATE TABLE IF NOT EXISTS leads (
  id               uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  -- hotel_id is nullable: lead may be for a hotel not yet in the DB
  hotel_id         uuid         REFERENCES hotels(id) ON DELETE SET NULL,
  hotel_name       text         NOT NULL,
  hotel_slug       text,
  -- user_id is nullable: supports anonymous lead submissions
  user_id          uuid         REFERENCES users(id) ON DELETE SET NULL,
  guest_name       text         NOT NULL,
  guest_email      text         NOT NULL,
  guest_phone      text,
  check_in         date,
  check_out        date,
  guests_count     smallint     DEFAULT 1,
  budget_range     text,
  special_requests text,
  source           text         DEFAULT 'website'
                                CHECK (source IN ('website', 'whatsapp', 'phone', 'email', 'partner')),
  channel          text,
  status           text         NOT NULL DEFAULT 'new'
                                CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  admin_notes      text,
  forwarded_at     timestamptz,
  created_at       timestamptz  DEFAULT now(),
  updated_at       timestamptz  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_hotel_id   ON leads (hotel_id);
CREATE INDEX IF NOT EXISTS idx_leads_hotel_slug ON leads (hotel_slug);
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email      ON leads (guest_email);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- Leads are created server-side only (service_role) — no public insert policy.
-- This protects guest PII from client-side exposure.

-- ─── 7. AFFILIATE CLICKS ─────────────────────────────────────────────────────
-- Detailed affiliate link click tracking for revenue attribution.
-- Supplements the existing engagement_events table with platform-level detail.
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id            uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id      uuid         REFERENCES hotels(id) ON DELETE SET NULL,
  hotel_slug    text         NOT NULL,
  deal_slug     text,
  platform      text         NOT NULL,          -- 'booking' | 'agoda' | 'expedia'
  affiliate_url text         NOT NULL,
  user_agent    text,
  ip_hash       text,                           -- SHA-256 of visitor IP (non-reversible, privacy-safe)
  referrer      text,
  city          text,
  country       text,
  created_at    timestamptz  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aff_hotel_slug  ON affiliate_clicks (hotel_slug);
CREATE INDEX IF NOT EXISTS idx_aff_platform    ON affiliate_clicks (platform);
CREATE INDEX IF NOT EXISTS idx_aff_created_at  ON affiliate_clicks (created_at DESC);

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert affiliate clicks"
  ON affiliate_clicks FOR INSERT
  WITH CHECK (true);

-- ─── HELPER VIEWS ────────────────────────────────────────────────────────────

-- Booking pipeline summary: counts per status for admin dashboard
CREATE OR REPLACE VIEW booking_pipeline AS
SELECT
  h.name        AS hotel_name,
  h.city,
  b.status,
  COUNT(*)      AS booking_count,
  SUM(b.total_amount) AS revenue
FROM bookings b
JOIN hotels h ON h.id = b.hotel_id
GROUP BY h.name, h.city, b.status
ORDER BY h.name, b.status;

-- Lead funnel: how many leads at each stage, by hotel
CREATE OR REPLACE VIEW lead_funnel AS
SELECT
  hotel_name,
  hotel_slug,
  status,
  COUNT(*)      AS lead_count,
  MIN(created_at) AS oldest_lead,
  MAX(created_at) AS newest_lead
FROM leads
GROUP BY hotel_name, hotel_slug, status
ORDER BY hotel_name, status;

-- Affiliate performance: clicks per platform per hotel (last 30 days)
CREATE OR REPLACE VIEW affiliate_performance AS
SELECT
  hotel_slug,
  platform,
  COUNT(*)      AS total_clicks,
  COUNT(DISTINCT date_trunc('day', created_at)) AS active_days
FROM affiliate_clicks
WHERE created_at >= now() - INTERVAL '30 days'
GROUP BY hotel_slug, platform
ORDER BY total_clicks DESC;

-- Hotel owner dashboard: bookings summary per owner
CREATE OR REPLACE VIEW owner_booking_summary AS
SELECT
  u.id          AS owner_id,
  u.full_name   AS owner_name,
  h.name        AS hotel_name,
  h.id          AS hotel_id,
  COUNT(b.id)   AS total_bookings,
  COUNT(b.id) FILTER (WHERE b.status = 'confirmed') AS confirmed_bookings,
  COALESCE(SUM(b.total_amount) FILTER (WHERE b.status IN ('confirmed', 'completed')), 0) AS total_revenue
FROM users u
JOIN hotels h ON h.owner_id = u.id
LEFT JOIN bookings b ON b.hotel_id = h.id
WHERE u.role = 'hotel_owner'
GROUP BY u.id, u.full_name, h.name, h.id;
