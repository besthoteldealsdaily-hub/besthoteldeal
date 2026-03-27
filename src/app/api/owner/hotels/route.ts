import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import { parsePagination, paginationMeta } from "@/lib/db";

/**
 * GET /api/owner/hotels
 * Returns the authenticated hotel owner's full hotel portfolio.
 * hotel_owner or admin role required.
 *
 * Query params: status, page, limit
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["hotel_owner", "admin"]);
  if (authErr) return authErr;

  const { searchParams } = request.nextUrl;
  const pagination = parsePagination(searchParams);
  const db = createServerClient();

  let query = db
    .from(TABLES.HOTELS)
    .select(
      `id, slug, name, city, country, stars, listing_type, status, hotel_type,
       cover_image, price_from, currency, verified, featured, allow_inquiry,
       admin_notes, rejected_reason, reviewed_at, created_at, updated_at`,
      { count: "exact" },
    )
    .eq("owner_id", user!.id);

  const status = searchParams.get("status");
  if (status) query = query.eq("status", status);

  query = query
    .order("created_at", { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[owner/hotels GET]", error.message);
    return Response.json({ error: "Failed to fetch hotels" }, { status: 500 });
  }

  // Status summary counts for the owner sidebar
  const statusCounts = await Promise.all(
    ["pending", "reviewing", "live", "approved", "rejected"].map(async (s) => {
      const { count: c } = await db
        .from(TABLES.HOTELS)
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user!.id)
        .eq("status", s);
      return [s, c ?? 0] as [string, number];
    }),
  );

  return Response.json({
    hotels:       data ?? [],
    meta:         paginationMeta(count ?? 0, pagination),
    statusCounts: Object.fromEntries(statusCounts),
  });
}
