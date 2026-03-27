import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";

type Params = { id: string };

/**
 * PATCH /api/rooms/[id]
 * Updates a room's details.
 * hotel_owner: must own the hotel this room belongs to.
 * admin: any room.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["hotel_owner", "admin"]);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const db = createServerClient();

    // Fetch room + hotel for ownership check
    const { data: room } = await db
      .from(TABLES.ROOMS)
      .select("id, hotel_id, hotels(owner_id)")
      .eq("id", id)
      .maybeSingle();

    if (!room) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    const hotel = Array.isArray(room.hotels) ? room.hotels[0] : room.hotels;
    if (user!.role !== "admin" && hotel?.owner_id !== user!.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowed = [
      "name", "description", "room_type", "price_per_night", "currency",
      "max_guests", "bed_type", "amenities", "images", "available", "total_rooms",
    ];

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const field of allowed) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const { data, error } = await db
      .from(TABLES.ROOMS)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[rooms/[id] PATCH]", error.message);
      return Response.json({ error: "Update failed" }, { status: 500 });
    }

    return Response.json({ success: true, room: data });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

/**
 * DELETE /api/rooms/[id]
 * Deletes a room. hotel_owner (own hotel) or admin.
 * Cascades room_availability entries.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["hotel_owner", "admin"]);
  if (authErr) return authErr;

  const db = createServerClient();

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

  const { error } = await db.from(TABLES.ROOMS).delete().eq("id", id);
  if (error) {
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }

  return Response.json({ success: true });
}
