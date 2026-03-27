import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import {
  generateBookingRef,
  parsePagination,
  paginationMeta,
  areDatesValid,
  calcNights,
  isValidEmail,
} from "@/lib/db";
import { notify } from "@/lib/notifications";

/**
 * POST /api/bookings
 * Creates a booking for a direct-listing hotel room.
 * Works for authenticated users and guest checkout (no account required).
 *
 * Body: { hotelSlug, roomId, guestName, guestEmail, guestPhone?,
 *         checkIn, checkOut, guestsCount?, roomsCount?, specialRequests? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hotelSlug, roomId, guestName, guestEmail, guestPhone,
      checkIn, checkOut, guestsCount, roomsCount, specialRequests,
    } = body;

    // ── Validation ───────────────────────────────────────────────────────────
    if (!hotelSlug || !roomId || !guestName || !guestEmail || !checkIn || !checkOut) {
      return Response.json(
        { error: "hotelSlug, roomId, guestName, guestEmail, checkIn, checkOut are required" },
        { status: 400 },
      );
    }

    if (!isValidEmail(guestEmail)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!areDatesValid(checkIn, checkOut)) {
      return Response.json(
        { error: "checkOut must be a valid date after checkIn" },
        { status: 400 },
      );
    }

    const db = createServerClient();

    // ── Resolve hotel ────────────────────────────────────────────────────────
    const { data: hotel } = await db
      .from(TABLES.HOTELS)
      .select("id, name, city, listing_type, status, currency")
      .eq("slug", hotelSlug)
      .maybeSingle();

    if (!hotel) {
      return Response.json({ error: "Hotel not found" }, { status: 404 });
    }

    if (!["approved", "live"].includes(hotel.status)) {
      return Response.json({ error: "Hotel is not accepting bookings" }, { status: 400 });
    }

    if (hotel.listing_type !== "direct") {
      return Response.json(
        { error: "This hotel does not support direct booking" },
        { status: 400 },
      );
    }

    // ── Resolve room ─────────────────────────────────────────────────────────
    const { data: room } = await db
      .from(TABLES.ROOMS)
      .select("id, name, price_per_night, currency, max_guests, available")
      .eq("id", roomId)
      .eq("hotel_id", hotel.id)
      .maybeSingle();

    if (!room) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    if (!room.available) {
      return Response.json({ error: "Room is not available" }, { status: 409 });
    }

    // ── Calculate total ──────────────────────────────────────────────────────
    const nights       = calcNights(checkIn, checkOut);
    const count        = roomsCount ?? 1;
    const totalAmount  = room.price_per_night * nights * count;
    const bookingRef   = generateBookingRef();

    // Optional: link to authenticated user
    const user = await getAuthUser(request);

    // ── Insert booking ───────────────────────────────────────────────────────
    const { data: booking, error } = await db
      .from(TABLES.BOOKINGS)
      .insert({
        booking_ref:     bookingRef,
        user_id:         user?.id          ?? null,
        hotel_id:        hotel.id,
        room_id:         room.id,
        guest_name:      guestName.trim(),
        guest_email:     guestEmail.toLowerCase().trim(),
        guest_phone:     guestPhone         ?? null,
        check_in:        checkIn,
        check_out:       checkOut,
        guests_count:    guestsCount        ?? 1,
        rooms_count:     count,
        price_per_night: room.price_per_night,
        total_amount:    totalAmount,
        currency:        room.currency      ?? hotel.currency ?? "USD",
        status:          "pending",
        special_requests: specialRequests   ?? null,
        payment_status:  "unpaid",
      })
      .select("id, booking_ref, status, total_amount, currency, check_in, check_out")
      .single();

    if (error) {
      console.error("[bookings POST]", error.message);
      return Response.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // ── Fire-and-forget email notifications ─────────────────────────────────
    // Sends guest confirmation + admin/owner action-required email.
    // Does not await — never blocks the API response.
    notify.bookingReceived({
      bookingRef:   bookingRef,
      guestName:    guestName.trim(),
      guestEmail:   guestEmail.toLowerCase().trim(),
      hotelName:    hotel.name,
      hotelCity:    hotel.city ?? "",
      roomName:     room.name,
      checkIn,
      checkOut,
      nights,
      guestsCount:  guestsCount ?? 1,
      totalAmount:  totalAmount,
      currency:     room.currency ?? hotel.currency ?? "USD",
      specialRequests: specialRequests ?? undefined,
    });

    return Response.json(
      {
        success:    true,
        booking,
        hotelName:  hotel.name,
        roomName:   room.name,
        nights,
        message:    "Booking received. The hotel team will confirm within 24 hours.",
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

/**
 * GET /api/bookings
 * Lists bookings, scoped by the caller's role:
 *   customer     → own bookings only
 *   hotel_owner  → bookings for their hotels
 *   admin        → all bookings (with optional hotel/status/date filters)
 *
 * Query params: status, hotel_slug, from, to, page, limit
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const authErr = requireRole(user);
  if (authErr) return authErr;

  const { searchParams } = request.nextUrl;
  const pagination = parsePagination(searchParams);
  const db = createServerClient();

  let query = db
    .from(TABLES.BOOKINGS)
    .select(
      `id, booking_ref, guest_name, guest_email, guest_phone,
       check_in, check_out, guests_count, rooms_count, total_amount, currency,
       status, payment_status, special_requests, created_at,
       hotels(id, name, slug, city),
       rooms(id, name, room_type)`,
      { count: "exact" },
    );

  // ── Role-based scope ───────────────────────────────────────────────────────
  if (user!.role === "customer") {
    query = query.eq("user_id", user!.id);
  } else if (user!.role === "hotel_owner") {
    // Subquery: only bookings for hotels this owner owns
    const { data: ownerHotels } = await db
      .from(TABLES.HOTELS)
      .select("id")
      .eq("owner_id", user!.id);
    const hotelIds = ownerHotels?.map((h) => h.id) ?? [];
    if (hotelIds.length === 0) {
      return Response.json({ bookings: [], meta: paginationMeta(0, pagination) });
    }
    query = query.in("hotel_id", hotelIds);
  }
  // admin: no scope filter — sees all

  // ── Optional filters ───────────────────────────────────────────────────────
  const status = searchParams.get("status");
  const from   = searchParams.get("from");
  const to     = searchParams.get("to");

  if (status) query = query.eq("status", status);
  if (from)   query = query.gte("check_in", from);
  if (to)     query = query.lte("check_in", to);

  query = query
    .order("created_at", { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[bookings GET]", error.message);
    return Response.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  return Response.json({
    bookings: data ?? [],
    meta:     paginationMeta(count ?? 0, pagination),
  });
}
