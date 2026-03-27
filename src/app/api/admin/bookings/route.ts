import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import { parsePagination, paginationMeta } from "@/lib/db";

/**
 * GET /api/admin/bookings
 * Full booking management view for admins.
 * Admin only.
 *
 * Query params: status, payment_status, hotel_id, from, to, search, page, limit
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["admin"]);
  if (authErr) return authErr;

  const { searchParams } = request.nextUrl;
  const pagination = parsePagination(searchParams);
  const db = createServerClient();

  let query = db
    .from(TABLES.BOOKINGS)
    .select(
      `id, booking_ref, user_id, guest_name, guest_email, guest_phone,
       check_in, check_out, guests_count, rooms_count, price_per_night,
       total_amount, currency, status, payment_status, payment_method,
       special_requests, admin_notes, confirmed_at, cancelled_at, created_at,
       hotels(id, name, slug, city, country),
       rooms(id, name, room_type)`,
      { count: "exact" },
    );

  const status        = searchParams.get("status");
  const paymentStatus = searchParams.get("payment_status");
  const hotelId       = searchParams.get("hotel_id");
  const from          = searchParams.get("from");
  const to            = searchParams.get("to");
  const search        = searchParams.get("search"); // guest name or email

  if (status)        query = query.eq("status", status);
  if (paymentStatus) query = query.eq("payment_status", paymentStatus);
  if (hotelId)       query = query.eq("hotel_id", hotelId);
  if (from)          query = query.gte("check_in", from);
  if (to)            query = query.lte("check_in", to);
  if (search)        query = query.or(
    `guest_name.ilike.%${search}%,guest_email.ilike.%${search}%,booking_ref.ilike.%${search}%`,
  );

  query = query
    .order("created_at", { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[admin/bookings GET]", error.message);
    return Response.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  // Status summary counts for dashboard cards
  const statusCounts = await Promise.all(
    ["pending", "confirmed", "completed", "cancelled", "refunded"].map(async (s) => {
      const { count: c } = await db
        .from(TABLES.BOOKINGS)
        .select("*", { count: "exact", head: true })
        .eq("status", s);
      return [s, c ?? 0] as [string, number];
    }),
  );

  return Response.json({
    bookings:     data ?? [],
    meta:         paginationMeta(count ?? 0, pagination),
    statusCounts: Object.fromEntries(statusCounts),
  });
}
