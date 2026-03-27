import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";

type Params = { slug: string };

/**
 * GET /api/hotels/[slug]/rooms
 * Lists all rooms for a hotel.
 * Public: rooms of live/approved hotels only.
 * Owners and admins can see rooms of any-status hotels they have access to.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const user = await getAuthUser(request);
  const db = createServerClient();

  // Resolve hotel (with access check)
  const { data: hotel } = await db
    .from(TABLES.HOTELS)
    .select("id, status, owner_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!hotel) {
    return Response.json({ error: "Hotel not found" }, { status: 404 });
  }

  const isPublic = ["approved", "live"].includes(hotel.status);
  const isOwner  = user?.id === hotel.owner_id;
  const isAdmin  = user?.role === "admin";

  if (!isPublic && !isOwner && !isAdmin) {
    return Response.json({ error: "Hotel not found" }, { status: 404 });
  }

  const { data: rooms, error } = await db
    .from(TABLES.ROOMS)
    .select("*")
    .eq("hotel_id", hotel.id)
    .order("price_per_night", { ascending: true });

  if (error) {
    return Response.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }

  return Response.json({ rooms: rooms ?? [] });
}

/**
 * POST /api/hotels/[slug]/rooms
 * Adds a room to a hotel.
 * hotel_owner: must own the hotel. admin: any hotel.
 *
 * Body: { name, roomType, pricePerNight, currency?, maxGuests, bedType?,
 *         amenities[]?, images[]?, description?, totalRooms? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["hotel_owner", "admin"]);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const {
      name, roomType, pricePerNight, currency,
      maxGuests, bedType, amenities, images,
      description, totalRooms, available,
    } = body;

    if (!name || !roomType || !pricePerNight) {
      return Response.json(
        { error: "name, roomType, and pricePerNight are required" },
        { status: 400 },
      );
    }

    const validTypes = ["single", "double", "twin", "suite", "family", "studio", "penthouse"];
    if (!validTypes.includes(roomType)) {
      return Response.json({ error: `roomType must be one of: ${validTypes.join(", ")}` }, { status: 400 });
    }

    const db = createServerClient();

    // Resolve hotel + ownership check
    const { data: hotel } = await db
      .from(TABLES.HOTELS)
      .select("id, owner_id")
      .eq("slug", slug)
      .maybeSingle();

    if (!hotel) {
      return Response.json({ error: "Hotel not found" }, { status: 404 });
    }

    if (user!.role !== "admin" && hotel.owner_id !== user!.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await db
      .from(TABLES.ROOMS)
      .insert({
        hotel_id:       hotel.id,
        name:           name.trim(),
        description:    description   ?? null,
        room_type:      roomType,
        price_per_night: parseFloat(pricePerNight),
        currency:       currency      ?? "USD",
        max_guests:     maxGuests     ?? 2,
        bed_type:       bedType       ?? null,
        amenities:      amenities     ?? [],
        images:         images        ?? [],
        available:      available     ?? true,
        total_rooms:    totalRooms    ?? 1,
      })
      .select()
      .single();

    if (error) {
      console.error("[rooms POST]", error.message);
      return Response.json({ error: "Failed to create room" }, { status: 500 });
    }

    return Response.json({ success: true, room: data }, { status: 201 });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
