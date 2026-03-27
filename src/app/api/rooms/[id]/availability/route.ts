import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";

type Params = { id: string };

/**
 * GET /api/rooms/[id]/availability
 * Returns availability records for a room within a date range.
 *
 * Query params: from (ISO date), to (ISO date)
 * Default: today through 90 days out.
 *
 * Returns an array of { date, available_count, price_override } objects.
 * Dates not in the array are considered fully available at the room's base price.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const { searchParams } = request.nextUrl;

  const from = searchParams.get("from") ?? new Date().toISOString().split("T")[0];
  const to   = searchParams.get("to")   ?? (() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split("T")[0];
  })();

  const db = createServerClient();
  const { data, error } = await db
    .from(TABLES.ROOM_AVAILABILITY)
    .select("date, available_count, price_override")
    .eq("room_id", id)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });

  if (error) {
    return Response.json({ error: "Failed to fetch availability" }, { status: 500 });
  }

  return Response.json({ availability: data ?? [], from, to });
}

/**
 * PUT /api/rooms/[id]/availability
 * Sets availability overrides for specific dates.
 * hotel_owner (own hotel) or admin.
 *
 * Body: { dates: [{ date, availableCount, priceOverride? }] }
 * Upserts — existing records for the same (room_id, date) are overwritten.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["hotel_owner", "admin"]);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { dates } = body;

    if (!Array.isArray(dates) || dates.length === 0) {
      return Response.json({ error: "dates array is required" }, { status: 400 });
    }

    const db = createServerClient();

    // Ownership check
    const { data: room } = await db
      .from(TABLES.ROOMS)
      .select("id, hotels(owner_id)")
      .eq("id", id)
      .maybeSingle();

    if (!room) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    const hotel = Array.isArray(room.hotels) ? room.hotels[0] : room.hotels;
    if (user!.role !== "admin" && hotel?.owner_id !== user!.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Upsert availability records
    const records = dates.map((d: { date: string; availableCount: number; priceOverride?: number }) => ({
      room_id:         id,
      date:            d.date,
      available_count: d.availableCount ?? 0,
      price_override:  d.priceOverride  ?? null,
    }));

    const { error } = await db
      .from(TABLES.ROOM_AVAILABILITY)
      .upsert(records, { onConflict: "room_id,date" });

    if (error) {
      console.error("[availability PUT]", error.message);
      return Response.json({ error: "Failed to update availability" }, { status: 500 });
    }

    return Response.json({ success: true, updated: records.length });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
