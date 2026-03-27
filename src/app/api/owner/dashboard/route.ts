import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";

/**
 * GET /api/owner/dashboard
 * Portfolio overview for hotel owners.
 * hotel_owner or admin role required.
 *
 * Returns:
 *   hotels     The owner's hotels (any status)
 *   bookings   Counts and revenue for their hotels
 *   leads      Lead funnel for their hotels
 *   pendingActions  Things needing attention (new bookings, new leads)
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["hotel_owner", "admin"]);
  if (authErr) return authErr;

  // Admins calling this endpoint for themselves get their own hotel portfolio
  const ownerId = user!.id;
  const db = createServerClient();

  // ── Fetch owner's hotels ───────────────────────────────────────────────────
  const { data: hotels } = await db
    .from(TABLES.HOTELS)
    .select("id, slug, name, city, listing_type, status, cover_image, price_from, currency, created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (!hotels || hotels.length === 0) {
    return Response.json({
      hotels:         [],
      bookings:       { total: 0, pending: 0, confirmed: 0, completed: 0, revenue: 0 },
      leads:          { total: 0, new: 0, contacted: 0, converted: 0 },
      pendingActions: { newBookings: 0, newLeads: 0 },
      recentBookings: [],
      recentLeads:    [],
    });
  }

  const hotelIds   = hotels.map((h) => h.id);
  const hotelSlugs = hotels.map((h) => h.slug).filter(Boolean);

  // ── Parallel data fetch ────────────────────────────────────────────────────
  const [
    { count: bookingsTotal },
    { count: bookingsPending },
    { count: bookingsConfirmed },
    { count: bookingsCompleted },
    { data: bookingRevenue },
    { count: leadsTotal },
    { count: leadsNew },
    { count: leadsContacted },
    { count: leadsConverted },
    { data: recentBookings },
    { data: recentLeads },
  ] = await Promise.all([
    db.from(TABLES.BOOKINGS).select("*", { count: "exact", head: true }).in("hotel_id", hotelIds),
    db.from(TABLES.BOOKINGS).select("*", { count: "exact", head: true }).in("hotel_id", hotelIds).eq("status", "pending"),
    db.from(TABLES.BOOKINGS).select("*", { count: "exact", head: true }).in("hotel_id", hotelIds).eq("status", "confirmed"),
    db.from(TABLES.BOOKINGS).select("*", { count: "exact", head: true }).in("hotel_id", hotelIds).eq("status", "completed"),
    db.from(TABLES.BOOKINGS).select("total_amount").in("hotel_id", hotelIds).in("status", ["confirmed", "completed"]),

    db.from(TABLES.LEADS).select("*", { count: "exact", head: true })
      .or(`hotel_id.in.(${hotelIds.join(",")}),hotel_slug.in.(${hotelSlugs.join(",")})`),
    db.from(TABLES.LEADS).select("*", { count: "exact", head: true })
      .or(`hotel_id.in.(${hotelIds.join(",")}),hotel_slug.in.(${hotelSlugs.join(",")})`)
      .eq("status", "new"),
    db.from(TABLES.LEADS).select("*", { count: "exact", head: true })
      .or(`hotel_id.in.(${hotelIds.join(",")}),hotel_slug.in.(${hotelSlugs.join(",")})`)
      .eq("status", "contacted"),
    db.from(TABLES.LEADS).select("*", { count: "exact", head: true })
      .or(`hotel_id.in.(${hotelIds.join(",")}),hotel_slug.in.(${hotelSlugs.join(",")})`)
      .eq("status", "converted"),

    db.from(TABLES.BOOKINGS)
      .select("id, booking_ref, guest_name, check_in, check_out, total_amount, currency, status, created_at, hotels(name)")
      .in("hotel_id", hotelIds)
      .order("created_at", { ascending: false })
      .limit(5),

    db.from(TABLES.LEADS)
      .select("id, guest_name, hotel_name, check_in, guests_count, source, status, created_at")
      .or(`hotel_id.in.(${hotelIds.join(",")}),hotel_slug.in.(${hotelSlugs.join(",")})`)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = (bookingRevenue ?? []).reduce((s, b) => s + (b.total_amount ?? 0), 0);

  return Response.json({
    hotels,
    bookings: {
      total:     bookingsTotal     ?? 0,
      pending:   bookingsPending   ?? 0,
      confirmed: bookingsConfirmed ?? 0,
      completed: bookingsCompleted ?? 0,
      revenue:   Math.round(totalRevenue),
      currency:  "USD",
    },
    leads: {
      total:     leadsTotal     ?? 0,
      new:       leadsNew       ?? 0,
      contacted: leadsContacted ?? 0,
      converted: leadsConverted ?? 0,
    },
    pendingActions: {
      newBookings: bookingsPending ?? 0,
      newLeads:    leadsNew       ?? 0,
    },
    recentBookings: recentBookings ?? [],
    recentLeads:    recentLeads    ?? [],
  });
}
