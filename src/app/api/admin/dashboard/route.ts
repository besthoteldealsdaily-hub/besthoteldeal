import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import { hotels as staticHotels, deals, cities } from "@/lib/data";

/**
 * GET /api/admin/dashboard
 * Unified admin dashboard — all KPIs in a single request.
 * Admin only.
 *
 * Returns:
 *   platform       Static inventory summary
 *   users          User counts by role
 *   hotels         DB hotel pipeline counts (by status + listing type)
 *   bookings       Booking counts by status + revenue summary
 *   leads          Lead funnel counts by status
 *   affiliates     Affiliate click stats (last 30 days)
 *   engagement     Top 5 deals + cities by click (last 7 days)
 *   recentActivity Last 10 actions across all tables
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["admin"]);
  if (authErr) return authErr;

  const db = createServerClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString();

  // Run all queries in parallel for speed
  const [
    // User counts
    { count: totalUsers },
    { count: customerCount },
    { count: ownerCount },

    // Hotel pipeline
    { count: hotelsTotal },
    { count: hotelsPending },
    { count: hotelsLive },
    { count: hotelsRejected },
    { data: hotelsByType },

    // Booking pipeline
    { count: bookingsTotal },
    { count: bookingsPending },
    { count: bookingsConfirmed },
    { count: bookingsCompleted },
    { count: bookingsCancelled },
    { data: revenueData },

    // Lead funnel
    { count: leadsTotal },
    { count: leadsNew },
    { count: leadsContacted },
    { count: leadsConverted },

    // Affiliate clicks (30 days)
    { count: affiliateClicks30d },
    { data: topPlatforms },

    // Newsletter
    { count: newsletterActive },

    // Partner applications
    { count: partnerPending },

    // Engagement top deals (7 days)
    { data: topDeals },
    { data: topCities },

    // Recent bookings
    { data: recentBookings },

    // Recent leads
    { data: recentLeads },

  ] = await Promise.all([
    db.from(TABLES.USERS).select("*", { count: "exact", head: true }),
    db.from(TABLES.USERS).select("*", { count: "exact", head: true }).eq("role", "customer"),
    db.from(TABLES.USERS).select("*", { count: "exact", head: true }).eq("role", "hotel_owner"),

    db.from(TABLES.HOTELS).select("*", { count: "exact", head: true }),
    db.from(TABLES.HOTELS).select("*", { count: "exact", head: true }).eq("status", "pending"),
    db.from(TABLES.HOTELS).select("*", { count: "exact", head: true }).eq("status", "live"),
    db.from(TABLES.HOTELS).select("*", { count: "exact", head: true }).eq("status", "rejected"),
    db.from(TABLES.HOTELS).select("listing_type"),

    db.from(TABLES.BOOKINGS).select("*", { count: "exact", head: true }),
    db.from(TABLES.BOOKINGS).select("*", { count: "exact", head: true }).eq("status", "pending"),
    db.from(TABLES.BOOKINGS).select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    db.from(TABLES.BOOKINGS).select("*", { count: "exact", head: true }).eq("status", "completed"),
    db.from(TABLES.BOOKINGS).select("*", { count: "exact", head: true }).eq("status", "cancelled"),
    db.from(TABLES.BOOKINGS).select("total_amount, currency").in("status", ["confirmed", "completed"]),

    db.from(TABLES.LEADS).select("*", { count: "exact", head: true }),
    db.from(TABLES.LEADS).select("*", { count: "exact", head: true }).eq("status", "new"),
    db.from(TABLES.LEADS).select("*", { count: "exact", head: true }).eq("status", "contacted"),
    db.from(TABLES.LEADS).select("*", { count: "exact", head: true }).eq("status", "converted"),

    db.from(TABLES.AFFILIATE_CLICKS).select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    db.from(TABLES.AFFILIATE_CLICKS).select("platform").gte("created_at", thirtyDaysAgo),

    db.from(TABLES.NEWSLETTER).select("*", { count: "exact", head: true }).eq("active", true),
    db.from(TABLES.PARTNER_APPLICATIONS).select("*", { count: "exact", head: true }).eq("status", "pending"),

    db.from(TABLES.ENGAGEMENT_EVENTS)
      .select("deal_slug")
      .eq("event_type", "deal_click")
      .not("deal_slug", "is", null)
      .gte("created_at", sevenDaysAgo)
      .limit(200),

    db.from(TABLES.ENGAGEMENT_EVENTS)
      .select("city")
      .not("city", "is", null)
      .gte("created_at", sevenDaysAgo)
      .limit(200),

    db.from(TABLES.BOOKINGS)
      .select("id, booking_ref, guest_name, total_amount, currency, status, created_at, hotels(name, city)")
      .order("created_at", { ascending: false })
      .limit(5),

    db.from(TABLES.LEADS)
      .select("id, guest_name, hotel_name, source, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // ── Aggregate hotel listing types ──────────────────────────────────────────
  const listingCounts = (hotelsByType ?? []).reduce<Record<string, number>>((acc, h) => {
    acc[h.listing_type] = (acc[h.listing_type] ?? 0) + 1;
    return acc;
  }, {});

  // ── Aggregate revenue ─────────────────────────────────────────────────────
  const totalRevenue = (revenueData ?? []).reduce((sum, b) => sum + (b.total_amount ?? 0), 0);

  // ── Aggregate affiliate platforms ─────────────────────────────────────────
  const platformCounts = (topPlatforms ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.platform] = (acc[c.platform] ?? 0) + 1;
    return acc;
  }, {});

  // ── Top deals (last 7d) ────────────────────────────────────────────────────
  const dealClickMap = (topDeals ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.deal_slug] = (acc[e.deal_slug] ?? 0) + 1;
    return acc;
  }, {});
  const topDealsSorted = Object.entries(dealClickMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, clicks]) => ({ slug, clicks }));

  // ── Top cities (last 7d) ───────────────────────────────────────────────────
  const cityClickMap = (topCities ?? []).reduce<Record<string, number>>((acc, e) => {
    if (e.city) acc[e.city] = (acc[e.city] ?? 0) + 1;
    return acc;
  }, {});
  const topCitiesSorted = Object.entries(cityClickMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, events]) => ({ city, events }));

  return Response.json({
    generatedAt: new Date().toISOString(),
    platform: {
      staticHotels:  staticHotels.length,
      staticDeals:   deals.filter((d) => new Date(d.validUntil) >= new Date()).length,
      staticCities:  cities.length,
    },
    users: {
      total:         totalUsers      ?? 0,
      customers:     customerCount   ?? 0,
      hotelOwners:   ownerCount      ?? 0,
    },
    hotels: {
      total:         hotelsTotal     ?? 0,
      pending:       hotelsPending   ?? 0,
      live:          hotelsLive      ?? 0,
      rejected:      hotelsRejected  ?? 0,
      byListingType: listingCounts,
    },
    bookings: {
      total:         bookingsTotal     ?? 0,
      pending:       bookingsPending   ?? 0,
      confirmed:     bookingsConfirmed ?? 0,
      completed:     bookingsCompleted ?? 0,
      cancelled:     bookingsCancelled ?? 0,
      totalRevenue:  Math.round(totalRevenue),
      currency:      "USD",
    },
    leads: {
      total:         leadsTotal     ?? 0,
      new:           leadsNew       ?? 0,
      contacted:     leadsContacted ?? 0,
      converted:     leadsConverted ?? 0,
      conversionRate: leadsTotal
        ? `${Math.round(((leadsConverted ?? 0) / leadsTotal) * 100)}%`
        : "0%",
    },
    affiliates: {
      clicks30d:     affiliateClicks30d ?? 0,
      byPlatform:    platformCounts,
    },
    newsletter: {
      activeSubscribers: newsletterActive ?? 0,
    },
    partnerApplications: {
      pending: partnerPending ?? 0,
    },
    engagement: {
      topDeals7d:    topDealsSorted,
      topCities7d:   topCitiesSorted,
    },
    recentActivity: {
      bookings: recentBookings ?? [],
      leads:    recentLeads    ?? [],
    },
  });
}
