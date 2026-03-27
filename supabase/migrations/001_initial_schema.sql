-- ============================================================
-- Best Hotel Deals Daily — Supabase Schema
-- Project: orcfnjhtshomyuosoraf
-- Run this in Supabase SQL Editor to create all tables.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. ENGAGEMENT EVENTS ────────────────────────────────────────────────────
-- Records every trackable user interaction: deal clicks, hotel views,
-- CTA button clicks, affiliate link opens. Powers trending badges and
-- smart deal sorting.
CREATE TABLE IF NOT EXISTS engagement_events (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type   text        NOT NULL,                         -- 'deal_click' | 'hotel_view' | 'cta_click' | 'affiliate_click'
  deal_slug    text,
  hotel_slug   text,
  city         text,
  country      text,
  source       text        DEFAULT 'web',                    -- 'web' | 'mobile' | 'app'
  platform     text        DEFAULT 'hotels',                 -- ecosystem platform identifier
  referrer     text,
  user_agent   text,
  session_id   text,                                         -- optional: for session-level grouping
  created_at   timestamptz DEFAULT now()
);

-- Index for fast deal performance queries (admin dashboard + trending)
CREATE INDEX IF NOT EXISTS idx_engagement_deal_slug  ON engagement_events (deal_slug);
CREATE INDEX IF NOT EXISTS idx_engagement_hotel_slug ON engagement_events (hotel_slug);
CREATE INDEX IF NOT EXISTS idx_engagement_city       ON engagement_events (city);
CREATE INDEX IF NOT EXISTS idx_engagement_created_at ON engagement_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_event_type ON engagement_events (event_type);

-- RLS: anyone can insert events, only service_role can read
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert engagement events"
  ON engagement_events FOR INSERT
  WITH CHECK (true);

-- ─── 2. PRICE ALERTS ─────────────────────────────────────────────────────────
-- Stores email subscriptions for price drop notifications per city/hotel.
-- Unique constraint prevents duplicate subscriptions.
CREATE TABLE IF NOT EXISTS price_alerts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email        text        NOT NULL,
  city         text        NOT NULL,
  hotel_slug   text,
  max_price    numeric,                                      -- alert when price drops below this
  currency     text        DEFAULT 'USD',
  active       boolean     DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  UNIQUE (email, city, hotel_slug)
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_city       ON price_alerts (city);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active     ON price_alerts (active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_price_alerts_hotel_slug ON price_alerts (hotel_slug);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert price alerts"
  ON price_alerts FOR INSERT
  WITH CHECK (true);

-- ─── 3. PARTNER APPLICATIONS ─────────────────────────────────────────────────
-- Hotel partner onboarding pipeline. Properties submit via /partner page.
-- Admin reviews and approves to activate direct-booking listings.
CREATE TABLE IF NOT EXISTS partner_applications (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_name   text        NOT NULL,
  owner_name   text        NOT NULL,
  owner_email  text        NOT NULL,
  owner_phone  text,
  city         text        NOT NULL,
  country      text,
  stars        smallint    CHECK (stars BETWEEN 1 AND 7),
  description  text,
  price_from   numeric,
  currency     text        DEFAULT 'USD',
  website      text,
  message      text,
  status       text        DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  reviewed_at  timestamptz,
  reviewed_by  text,
  notes        text,                                         -- internal admin notes
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_status     ON partner_applications (status);
CREATE INDEX IF NOT EXISTS idx_partner_city       ON partner_applications (city);
CREATE INDEX IF NOT EXISTS idx_partner_created_at ON partner_applications (created_at DESC);

ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert partner applications"
  ON partner_applications FOR INSERT
  WITH CHECK (true);

-- ─── 4. NEWSLETTER SUBSCRIBERS ───────────────────────────────────────────────
-- Email list from the footer "Get Daily Deal Alerts" form.
-- Source field tracks which surface the signup came from.
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email        text        NOT NULL UNIQUE,
  source       text        DEFAULT 'footer',                 -- 'footer' | 'deal_page' | 'city_page' | 'popup'
  city_interest text,                                        -- optional: which city they signed up from
  active       boolean     DEFAULT true,
  unsubscribed_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_active     ON newsletter_subscribers (active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscribers (created_at DESC);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert newsletter subscribers"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- ─── 5. BOOKING INQUIRIES ─────────────────────────────────────────────────────
-- Direct booking form submissions for hotels with listingType: 'direct'.
-- Stores guest details + selected room + dates for hotel owner response.
CREATE TABLE IF NOT EXISTS booking_inquiries (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_slug   text        NOT NULL,
  hotel_name   text,
  city         text,
  country      text,
  room_id      text,                                         -- selected room ID from hotel's rooms array
  guest_name   text        NOT NULL,
  guest_email  text        NOT NULL,
  guest_phone  text,
  check_in     date        NOT NULL,
  check_out    date        NOT NULL,
  guests       smallint    DEFAULT 1,
  rooms        smallint    DEFAULT 1,
  special_requests text,
  status       text        DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'cancelled', 'completed')),
  channel      text        DEFAULT 'web',                    -- 'web' | 'whatsapp'
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_hotel_slug  ON booking_inquiries (hotel_slug);
CREATE INDEX IF NOT EXISTS idx_bookings_status      ON booking_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at  ON booking_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in    ON booking_inquiries (check_in);

ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;
-- Booking inquiries are created server-side only (service_role) — no public insert policy

-- ─── 6. DEAL VIEWS ───────────────────────────────────────────────────────────
-- Lightweight impression tracking per deal. Separate from engagement_events
-- for fast aggregation queries. Powers "X people viewed this today" social proof.
CREATE TABLE IF NOT EXISTS deal_views (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_slug    text        NOT NULL,
  city         text,
  country      text,
  source       text        DEFAULT 'web',
  viewed_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_views_slug      ON deal_views (deal_slug);
CREATE INDEX IF NOT EXISTS idx_deal_views_viewed_at ON deal_views (viewed_at DESC);

ALTER TABLE deal_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert deal views"
  ON deal_views FOR INSERT
  WITH CHECK (true);

-- ─── 7. WHATSAPP LEADS ───────────────────────────────────────────────────────
-- High-ticket WhatsApp inquiry tracking. When a user taps "Book via WhatsApp"
-- on a luxury or pilgrim hotel, we log the lead for CRM and attribution.
CREATE TABLE IF NOT EXISTS whatsapp_leads (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_slug   text        NOT NULL,
  hotel_name   text,
  deal_slug    text,
  city         text,
  country      text,
  price_point  numeric,                                      -- price shown at time of click
  currency     text,
  source_page  text,                                         -- 'city' | 'landmark' | 'deal' | 'hotel'
  user_agent   text,
  referrer     text,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_hotel_slug  ON whatsapp_leads (hotel_slug);
CREATE INDEX IF NOT EXISTS idx_whatsapp_city        ON whatsapp_leads (city);
CREATE INDEX IF NOT EXISTS idx_whatsapp_created_at  ON whatsapp_leads (created_at DESC);

ALTER TABLE whatsapp_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert whatsapp leads"
  ON whatsapp_leads FOR INSERT
  WITH CHECK (true);

-- ─── HELPER VIEW: Daily engagement summary ───────────────────────────────────
-- Useful for admin dashboard — total events by type for the last 30 days.
CREATE OR REPLACE VIEW daily_engagement_summary AS
SELECT
  date_trunc('day', created_at) AS day,
  event_type,
  city,
  COUNT(*) AS event_count
FROM engagement_events
WHERE created_at >= now() - INTERVAL '30 days'
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 4 DESC;

-- ─── HELPER VIEW: Top deals by clicks ────────────────────────────────────────
CREATE OR REPLACE VIEW top_deals_by_clicks AS
SELECT
  deal_slug,
  COUNT(*) AS total_clicks,
  COUNT(DISTINCT date_trunc('day', created_at)) AS active_days
FROM engagement_events
WHERE event_type = 'deal_click'
  AND deal_slug IS NOT NULL
GROUP BY deal_slug
ORDER BY total_clicks DESC;

-- ─── HELPER VIEW: Newsletter growth ──────────────────────────────────────────
CREATE OR REPLACE VIEW newsletter_growth AS
SELECT
  date_trunc('week', created_at) AS week,
  source,
  COUNT(*) AS new_subscribers
FROM newsletter_subscribers
GROUP BY 1, 2
ORDER BY 1 DESC;
