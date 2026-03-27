import { createClient } from "@supabase/supabase-js";

// ── Client-side client (anon key) ────────────────────────────────────────────
// Safe to use in browser and Server Components for public reads.
// Respects Row Level Security — anon users can only see what RLS allows.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Server-side client (service role key) ────────────────────────────────────
// NEVER import this in client components or expose to the browser.
// Bypasses RLS — use only in API routes and server-side logic.
// Gives full read/write access to all tables.
export function createServerClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — server client cannot be created.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ── Database table names (single source of truth) ────────────────────────────
// Import from here instead of hardcoding table names in API routes.
export const TABLES = {
  // ── Migration 001: engagement & lead capture (static-data era) ────────────
  ENGAGEMENT_EVENTS:    "engagement_events",
  PRICE_ALERTS:         "price_alerts",
  PARTNER_APPLICATIONS: "partner_applications",
  NEWSLETTER:           "newsletter_subscribers",
  BOOKING_INQUIRIES:    "booking_inquiries",
  DEAL_VIEWS:           "deal_views",
  WHATSAPP_LEADS:       "whatsapp_leads",

  // ── Migration 002: full backend (DB-managed hotels, bookings, leads) ──────
  USERS:              "users",
  HOTELS:             "hotels",
  ROOMS:              "rooms",
  ROOM_AVAILABILITY:  "room_availability",
  BOOKINGS:           "bookings",
  LEADS:              "leads",
  AFFILIATE_CLICKS:   "affiliate_clicks",
} as const;
