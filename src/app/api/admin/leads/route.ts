import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import { parsePagination, paginationMeta } from "@/lib/db";

/**
 * GET /api/admin/leads
 * Full lead management view for admins.
 * Admin only.
 *
 * Query params: status, source, hotel_slug, from, to, search, page, limit
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["admin"]);
  if (authErr) return authErr;

  const { searchParams } = request.nextUrl;
  const pagination = parsePagination(searchParams);
  const db = createServerClient();

  let query = db
    .from(TABLES.LEADS)
    .select(
      `id, hotel_id, hotel_name, hotel_slug, user_id,
       guest_name, guest_email, guest_phone,
       check_in, check_out, guests_count, budget_range,
       special_requests, source, channel, status, admin_notes,
       forwarded_at, created_at, updated_at`,
      { count: "exact" },
    );

  const status    = searchParams.get("status");
  const source    = searchParams.get("source");
  const hotelSlug = searchParams.get("hotel_slug");
  const from      = searchParams.get("from");
  const to        = searchParams.get("to");
  const search    = searchParams.get("search");

  if (status)    query = query.eq("status", status);
  if (source)    query = query.eq("source", source);
  if (hotelSlug) query = query.eq("hotel_slug", hotelSlug);
  if (from)      query = query.gte("created_at", from);
  if (to)        query = query.lte("created_at", to);
  if (search)    query = query.or(
    `guest_name.ilike.%${search}%,guest_email.ilike.%${search}%,hotel_name.ilike.%${search}%`,
  );

  query = query
    .order("created_at", { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[admin/leads GET]", error.message);
    return Response.json({ error: "Failed to fetch leads" }, { status: 500 });
  }

  // Funnel counts for dashboard
  const funnelCounts = await Promise.all(
    ["new", "contacted", "qualified", "converted", "lost"].map(async (s) => {
      const { count: c } = await db
        .from(TABLES.LEADS)
        .select("*", { count: "exact", head: true })
        .eq("status", s);
      return [s, c ?? 0] as [string, number];
    }),
  );

  return Response.json({
    leads:        data ?? [],
    meta:         paginationMeta(count ?? 0, pagination),
    funnelCounts: Object.fromEntries(funnelCounts),
  });
}
