import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import {
  generateSlug,
  ensureUniqueHotelSlug,
  parsePagination,
  paginationMeta,
} from "@/lib/db";

/**
 * GET /api/hotels
 * Public endpoint — lists DB-managed hotels with optional filters.
 *
 * Query params:
 *   city, country, listing_type, hotel_type, status (admin only)
 *   stars, min_price, max_price, near_haram, featured, search
 *   page (default 1), limit (default 20, max 100)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pagination = parsePagination(searchParams);

  // Authenticated users (especially admins) can filter by status;
  // public requests always see only live/approved hotels.
  const user = await getAuthUser(request);

  const db = createServerClient();
  let query = db
    .from(TABLES.HOTELS)
    .select(
      `id, slug, name, short_description, city, country, stars, rating,
       review_count, listing_type, status, hotel_type, amenities, cover_image,
       images, price_from, currency, affiliate_links, near_haram,
       distance_from_haram, distance_from_center, verified, featured,
       allow_inquiry, check_in_time, check_out_time, cancellation_policy,
       created_at`,
      { count: "exact" },
    );

  // ── Status filter ──────────────────────────────────────────────────────────
  if (user?.role === "admin") {
    // Admins can filter by any status or see all
    const statusFilter = searchParams.get("status");
    if (statusFilter) query = query.eq("status", statusFilter);
  } else if (user?.role === "hotel_owner") {
    // Owners see their own hotels (any status) + other live hotels
    query = query.or(`status.in.(approved,live),owner_id.eq.${user.id}`);
  } else {
    // Public: only live/approved
    query = query.in("status", ["approved", "live"]);
  }

  // ── Optional filters ───────────────────────────────────────────────────────
  const city         = searchParams.get("city");
  const country      = searchParams.get("country");
  const listingType  = searchParams.get("listing_type");
  const hotelType    = searchParams.get("hotel_type");
  const stars        = searchParams.get("stars");
  const minPrice     = searchParams.get("min_price");
  const maxPrice     = searchParams.get("max_price");
  const nearHaram    = searchParams.get("near_haram");
  const featured     = searchParams.get("featured");
  const search       = searchParams.get("search");

  if (city)        query = query.ilike("city", `%${city}%`);
  if (country)     query = query.ilike("country", `%${country}%`);
  if (listingType) query = query.eq("listing_type", listingType);
  if (hotelType)   query = query.eq("hotel_type", hotelType);
  if (stars)       query = query.eq("stars", parseInt(stars, 10));
  if (minPrice)    query = query.gte("price_from", parseFloat(minPrice));
  if (maxPrice)    query = query.lte("price_from", parseFloat(maxPrice));
  if (nearHaram === "true")  query = query.eq("near_haram", true);
  if (featured  === "true")  query = query.eq("featured",   true);
  if (search)      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,description.ilike.%${search}%`);

  // ── Sorting ────────────────────────────────────────────────────────────────
  query = query
    .order("featured",   { ascending: false })
    .order("rating",     { ascending: false })
    .order("created_at", { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[hotels GET]", error.message);
    return Response.json({ error: "Failed to fetch hotels" }, { status: 500 });
  }

  return Response.json({
    hotels: data ?? [],
    meta:   paginationMeta(count ?? 0, pagination),
  });
}

/**
 * POST /api/hotels
 * Creates a new hotel listing. Requires hotel_owner or admin role.
 *
 * Hotel owners create listings in 'pending' status (require admin approval).
 * Admins can create listings in any status.
 *
 * Body: { name, city, country, description, listingType, hotelType, stars,
 *         priceFrom, currency, amenities[], affiliateLinks{}, coverImage,
 *         phone, address, checkInTime, checkOutTime, cancellationPolicy,
 *         nearHaram, distanceFromHaram, distanceFromCenter, commissionRate }
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["hotel_owner", "admin"]);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const {
      name, city, country, description, shortDescription,
      listingType, hotelType, stars, priceFrom, currency,
      amenities, affiliateLinks, coverImage, images, address,
      latitude, longitude, checkInTime, checkOutTime, cancellationPolicy,
      nearHaram, distanceFromHaram, distanceFromCenter,
      commissionRate, allowInquiry,
    } = body;

    if (!name || !city || !country) {
      return Response.json(
        { error: "name, city, and country are required" },
        { status: 400 },
      );
    }

    if (listingType && !["affiliate", "direct", "lead"].includes(listingType)) {
      return Response.json({ error: "Invalid listing_type" }, { status: 400 });
    }

    // Generate a unique slug from the hotel name
    const baseSlug = generateSlug(name);
    const slug = await ensureUniqueHotelSlug(baseSlug);

    // Admins can set any status; hotel owners always start as pending
    const status = user!.role === "admin" ? (body.status ?? "pending") : "pending";

    const db = createServerClient();
    const { data, error } = await db
      .from(TABLES.HOTELS)
      .insert({
        owner_id:             user!.id,
        name:                 name.trim(),
        slug,
        description:          description      ?? null,
        short_description:    shortDescription ?? null,
        city:                 city.trim(),
        country:              country.trim(),
        address:              address          ?? null,
        latitude:             latitude         ?? null,
        longitude:            longitude        ?? null,
        stars:                stars            ?? null,
        listing_type:         listingType      ?? "affiliate",
        status,
        hotel_type:           hotelType        ?? null,
        amenities:            amenities        ?? [],
        images:               images           ?? [],
        cover_image:          coverImage       ?? null,
        price_from:           priceFrom        ?? null,
        currency:             currency         ?? "USD",
        affiliate_links:      affiliateLinks   ?? {},
        commission_rate:      commissionRate   ?? 10.00,
        check_in_time:        checkInTime      ?? "14:00",
        check_out_time:       checkOutTime     ?? "12:00",
        cancellation_policy:  cancellationPolicy ?? null,
        near_haram:           nearHaram        ?? false,
        distance_from_haram:  distanceFromHaram  ?? null,
        distance_from_center: distanceFromCenter ?? null,
        allow_inquiry:        allowInquiry     ?? true,
      })
      .select("id, slug, name, status")
      .single();

    if (error) {
      console.error("[hotels POST]", error.message);
      return Response.json({ error: "Failed to create hotel" }, { status: 500 });
    }

    return Response.json(
      {
        success: true,
        hotel:   data,
        message:
          user!.role === "admin"
            ? "Hotel created."
            : "Hotel submitted for review. You will be notified once approved.",
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
