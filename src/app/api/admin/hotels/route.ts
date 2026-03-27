import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import { parsePagination, paginationMeta } from "@/lib/db";

/**
 * GET /api/admin/hotels
 * Returns all DB-managed hotel listings with full detail for the admin dashboard.
 * Admin only.
 *
 * Query params: status, city, listing_type, owner_id, search, page, limit
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["admin"]);
  if (authErr) return authErr;

  const { searchParams } = request.nextUrl;
  const pagination = parsePagination(searchParams);
  const db = createServerClient();

  let query = db
    .from(TABLES.HOTELS)
    .select(
      `id, slug, name, city, country, stars, listing_type, status, hotel_type,
       cover_image, price_from, currency, verified, featured, near_haram,
       owner_id, admin_notes, rejected_reason, reviewed_at, reviewed_by,
       created_at, updated_at,
       users!owner_id(id, full_name, email, phone)`,
      { count: "exact" },
    );

  const status      = searchParams.get("status");
  const city        = searchParams.get("city");
  const listingType = searchParams.get("listing_type");
  const ownerId     = searchParams.get("owner_id");
  const search      = searchParams.get("search");

  if (status)      query = query.eq("status", status);
  if (city)        query = query.ilike("city", `%${city}%`);
  if (listingType) query = query.eq("listing_type", listingType);
  if (ownerId)     query = query.eq("owner_id", ownerId);
  if (search)      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);

  query = query
    .order("created_at", { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[admin/hotels GET]", error.message);
    return Response.json({ error: "Failed to fetch hotels" }, { status: 500 });
  }

  // Pending count for badge
  const { count: pendingCount } = await db
    .from(TABLES.HOTELS)
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return Response.json({
    hotels:       data ?? [],
    meta:         paginationMeta(count ?? 0, pagination),
    pendingCount: pendingCount ?? 0,
  });
}
