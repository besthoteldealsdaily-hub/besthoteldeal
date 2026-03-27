import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { hotels, deals, cities, countries, blogPosts, landmarks, categories } from "@/lib/data";
import { umrahPackages } from "@/lib/umrah-data";
import { transferRoutes } from "@/lib/transfers-data";
import { ECOSYSTEM } from "@/lib/ecosystem";

/**
 * Admin Metrics API
 * Aggregates platform KPIs for the admin dashboard and due diligence reporting.
 * Protected by bearer token. Uses service role client for full DB read access.
 */
export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const expectedToken = process.env.ADMIN_API_TOKEN;

  if (expectedToken && token !== expectedToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Static inventory metrics ─────────────────────────────────────────────
  const inventory = {
    totalHotels:          hotels.length,
    totalDeals:           deals.length,
    totalCities:          cities.length,
    totalCountries:       countries.length,
    totalBlogPosts:       blogPosts.length,
    totalLandmarks:       landmarks.length,
    totalCategories:      categories.length,
    totalUmrahPackages:   umrahPackages.length,
    totalTransferRoutes:  transferRoutes.length,
    totalPages:
      hotels.length + deals.length + cities.length + countries.length +
      blogPosts.length + landmarks.length + categories.length +
      umrahPackages.length + transferRoutes.length + 12,
  };

  const hotelsByType = hotels.reduce<Record<string, number>>((acc, h) => {
    acc[h.type] = (acc[h.type] || 0) + 1;
    return acc;
  }, {});

  const listingBreakdown = {
    affiliate: hotels.filter((h) => h.listingType === "affiliate").length,
    direct:    hotels.filter((h) => h.listingType === "direct").length,
    lead:      hotels.filter((h) => h.listingType === "lead").length,
  };

  const activeDeals   = deals.filter((d) => new Date(d.validUntil) >= new Date());
  const avgDiscount   = deals.length > 0 ? Math.round(deals.reduce((sum, d) => sum + d.discount, 0) / deals.length) : 0;
  const featuredDeals = deals.filter((d) => d.featured).length;

  const contentMetrics = {
    pagesPerCity:    Math.round(inventory.totalPages / cities.length),
    dealsPerCity:    (deals.length / cities.length).toFixed(1),
    avgHotelRating:  (hotels.reduce((s, h) => s + h.rating, 0) / hotels.length).toFixed(1),
    avgHotelReviews: Math.round(hotels.reduce((s, h) => s + h.reviewCount, 0) / hotels.length),
  };

  // ── Live Supabase engagement metrics ────────────────────────────────────
  // Using service role client — bypasses RLS to read all rows
  let supabaseMetrics = null;
  try {
    const db = createServerClient();

    const [
      { count: totalEvents },
      { count: partnerApps },
      { count: pendingApps },
      { count: newsletterSubs },
      { count: bookingInquiries },
      { count: whatsappLeads },
      { data: topDeals },
    ] = await Promise.all([
      db.from(TABLES.ENGAGEMENT_EVENTS).select("*", { count: "exact", head: true }),
      db.from(TABLES.PARTNER_APPLICATIONS).select("*", { count: "exact", head: true }),
      db.from(TABLES.PARTNER_APPLICATIONS).select("*", { count: "exact", head: true }).eq("status", "pending"),
      db.from(TABLES.NEWSLETTER).select("*", { count: "exact", head: true }).eq("active", true),
      db.from(TABLES.BOOKING_INQUIRIES).select("*", { count: "exact", head: true }),
      db.from(TABLES.WHATSAPP_LEADS).select("*", { count: "exact", head: true }),
      db.from(TABLES.ENGAGEMENT_EVENTS)
        .select("deal_slug")
        .eq("event_type", "deal_click")
        .not("deal_slug", "is", null)
        .limit(5),
    ]);

    supabaseMetrics = {
      totalEngagementEvents:     totalEvents     || 0,
      totalPartnerApplications:  partnerApps     || 0,
      pendingPartnerApplications: pendingApps    || 0,
      activeNewsletterSubscribers: newsletterSubs || 0,
      totalBookingInquiries:     bookingInquiries || 0,
      totalWhatsappLeads:        whatsappLeads   || 0,
      recentDealClicks:          topDeals?.map((r) => r.deal_slug) || [],
    };
  } catch (err) {
    console.error("[metrics] Supabase error:", err);
    supabaseMetrics = null;
  }

  return Response.json({
    generatedAt: new Date().toISOString(),
    platform:    "Best Hotel Deals Daily",
    domain:      "besthoteldealsdaily.com",
    market:      "Middle East Hotel & Travel",
    inventory,
    hotelsByType,
    listingBreakdown,
    revenueStreams: {
      affiliateCommission: "CPA/CPC via Booking.com, Agoda, Expedia partner programs",
      directBookings:      `${listingBreakdown.direct} hotels with 10-15% commission on direct bookings`,
      leadGeneration:      `${listingBreakdown.lead} hotels with WhatsApp lead-gen model`,
      partnerListings:     "Free-to-list with premium placement upsell potential",
    },
    cityCoverage: cities.map((c) => ({ name: c.name, country: c.country, hotelCount: c.hotels.length })),
    dealMetrics: {
      activeDeals:  activeDeals.length,
      totalDeals:   deals.length,
      avgDiscount:  `${avgDiscount}%`,
      featuredDeals,
    },
    contentMetrics,
    supabaseMetrics,
    ecosystem: {
      platforms:      ECOSYSTEM.map((p) => ({ id: p.id, name: p.name, status: p.status, revenueModel: p.revenueModel })),
      livePlatforms:  ECOSYSTEM.filter((p) => p.status === "live").length,
      totalPlatforms: ECOSYSTEM.length,
    },
    moat: {
      seoPages:         inventory.totalPages,
      programmaticSEO:  true,
      seasonalEngine:   true,
      structuredData:   ["Organization", "WebSite", "SiteNavigationElement", "FAQPage", "LodgingBusiness", "Offer", "TouristAttraction"],
      aiSearchOptimized: true,
      multiRevenueModel: true,
      multiVertical:    true,
    },
  });
}
