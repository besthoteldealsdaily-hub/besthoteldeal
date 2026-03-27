import { NextRequest, NextResponse } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { hotels as staticHotels } from "@/lib/data";

/**
 * GET /api/affiliate?slug=grand-hyatt-dubai&platform=booking
 *
 * Affiliate click tracker + redirect.
 * Logs the click server-side, then issues a 302 to the affiliate URL.
 * Zero cost — no third-party affiliate network, tracking is self-hosted in Supabase.
 *
 * Query params:
 *   slug     (required) Hotel slug
 *   platform (required) "booking" | "agoda" | "expedia" | "direct"
 *   deal     (optional) Deal slug for attribution
 *   ref      (optional) Referrer surface: "city" | "deal" | "hotel" | "search"
 *
 * The redirect target is resolved in this order:
 *   1. DB hotels table (affiliate_links JSONB field)
 *   2. Static data.ts hotels (affiliateLinks field)
 *   3. 404 if no link found
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug     = searchParams.get("slug");
  const platform = searchParams.get("platform");
  const deal     = searchParams.get("deal")   ?? null;
  const ref      = searchParams.get("ref")    ?? "direct";

  if (!slug || !platform) {
    return Response.json(
      { error: "slug and platform are required" },
      { status: 400 },
    );
  }

  const validPlatforms = ["booking", "agoda", "expedia", "direct"];
  if (!validPlatforms.includes(platform)) {
    return Response.json(
      { error: `platform must be one of: ${validPlatforms.join(", ")}` },
      { status: 400 },
    );
  }

  // ── Resolve affiliate URL ──────────────────────────────────────────────────
  let affiliateUrl: string | null = null;
  let hotelId: string | null = null;
  let city: string | null = null;
  let country: string | null = null;

  // 1. Try DB hotels first (DB hotels may have fresher/updated links)
  const db = createServerClient();
  const { data: dbHotel } = await db
    .from(TABLES.HOTELS)
    .select("id, affiliate_links, city, country")
    .eq("slug", slug)
    .in("status", ["approved", "live"])
    .maybeSingle();

  if (dbHotel) {
    hotelId      = dbHotel.id;
    city         = dbHotel.city;
    country      = dbHotel.country;
    const links  = dbHotel.affiliate_links as Record<string, string> | null;
    affiliateUrl = links?.[platform] ?? null;
  }

  // 2. Fall back to static data (data.ts has 500+ hotels)
  if (!affiliateUrl) {
    const staticHotel = staticHotels.find((h) => h.slug === slug);
    if (staticHotel) {
      city         = city    ?? staticHotel.city;
      country      = country ?? staticHotel.country;
      const links  = staticHotel.affiliateLinks as Record<string, string> | undefined;
      affiliateUrl = links?.[platform] ?? null;

      // For affiliate hotels, the main affiliateLink is often on the hotel object
      if (!affiliateUrl && platform === "booking" && "affiliateLink" in staticHotel) {
        affiliateUrl = (staticHotel as { affiliateLink?: string }).affiliateLink ?? null;
      }
    }
  }

  if (!affiliateUrl) {
    return Response.json(
      { error: "No affiliate link found for this hotel and platform" },
      { status: 404 },
    );
  }

  // ── Log the click (fire-and-forget) ───────────────────────────────────────
  // Stored in affiliate_clicks (migration 002) for revenue attribution.
  // Uses IP hash (non-reversible) for deduplication — no PII stored.
  const userAgent  = request.headers.get("user-agent") ?? null;
  const referrer   = request.headers.get("referer")    ?? null;
  const ipRaw      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
                     ?? request.headers.get("x-real-ip")
                     ?? "unknown";

  // Simple hash to avoid storing raw IP (privacy-safe deduplication)
  let ipHash: string | null = null;
  try {
    const encoded  = new TextEncoder().encode(ipRaw);
    const hashBuf  = await crypto.subtle.digest("SHA-256", encoded);
    ipHash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16); // 16 hex chars — enough for dedup, too short to reverse
  } catch {
    // crypto.subtle unavailable in some environments — skip hash
  }

  // Non-blocking insert
  db.from(TABLES.AFFILIATE_CLICKS).insert({
    hotel_id:     hotelId,
    hotel_slug:   slug,
    deal_slug:    deal,
    platform,
    affiliate_url: affiliateUrl,
    user_agent:   userAgent,
    ip_hash:      ipHash,
    referrer:     referrer ?? ref,
    city,
    country,
  }).then(({ error }) => {
    if (error) console.error("[affiliate] click log failed:", error.message);
  });

  // Also log to the existing engagement_events table for dashboard continuity
  db.from(TABLES.ENGAGEMENT_EVENTS).insert({
    event_type:  "affiliate_click",
    hotel_slug:  slug,
    deal_slug:   deal,
    city,
    country,
    source:      ref,
    platform:    "hotels",
    referrer,
    user_agent:  userAgent,
  }).then(({ error }) => {
    if (error) console.error("[affiliate] engagement log failed:", error.message);
  });

  // ── 302 Redirect ──────────────────────────────────────────────────────────
  return NextResponse.redirect(affiliateUrl, { status: 302 });
}
