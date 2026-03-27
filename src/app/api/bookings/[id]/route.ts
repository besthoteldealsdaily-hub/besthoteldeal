import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import { notify } from "@/lib/notifications";

type Params = { id: string };

/**
 * GET /api/bookings/[id]
 * Returns a single booking.
 * customer: own booking only. hotel_owner: own hotel's booking. admin: any.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const user = await getAuthUser(request);
  const authErr = requireRole(user);
  if (authErr) return authErr;

  const db = createServerClient();
  const { data: booking, error } = await db
    .from(TABLES.BOOKINGS)
    .select(`
      *,
      hotels(id, name, slug, city, country, check_in_time, check_out_time, cover_image),
      rooms(id, name, room_type, bed_type, images)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  // Access control
  if (user!.role === "customer" && booking.user_id !== user!.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (user!.role === "hotel_owner") {
    const hotel = Array.isArray(booking.hotels) ? booking.hotels[0] : booking.hotels;
    // Check ownership by verifying hotel exists in owner's portfolio
    const { data: ownerHotel } = await db
      .from(TABLES.HOTELS)
      .select("id")
      .eq("id", booking.hotel_id)
      .eq("owner_id", user!.id)
      .maybeSingle();
    if (!ownerHotel) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return Response.json({ booking });
}

/**
 * PATCH /api/bookings/[id]
 * Updates a booking's status.
 *
 * hotel_owner: can confirm or cancel their hotel's bookings.
 * admin: can set any status, add notes, update payment status.
 *
 * Body: { status?, paymentStatus?, paymentMethod?, adminNotes?, specialRequests? }
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

    const { data: booking } = await db
      .from(TABLES.BOOKINGS)
      .select("id, hotel_id, status")
      .eq("id", id)
      .maybeSingle();

    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    // Ownership check for hotel_owner
    if (user!.role === "hotel_owner") {
      const { data: ownerHotel } = await db
        .from(TABLES.HOTELS)
        .select("id")
        .eq("id", booking.hotel_id)
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (!ownerHotel) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // hotel_owner can only confirm or cancel
    const ownerAllowedStatuses = ["confirmed", "cancelled"];
    if (body.status) {
      if (user!.role === "hotel_owner" && !ownerAllowedStatuses.includes(body.status)) {
        return Response.json(
          { error: "Hotel owners can only confirm or cancel bookings" },
          { status: 400 },
        );
      }
      updates.status = body.status;
      if (body.status === "confirmed") updates.confirmed_at = new Date().toISOString();
      if (body.status === "cancelled") updates.cancelled_at = new Date().toISOString();
    }

    // Admin-only fields
    if (user!.role === "admin") {
      if (body.paymentStatus  !== undefined) updates.payment_status  = body.paymentStatus;
      if (body.paymentMethod  !== undefined) updates.payment_method  = body.paymentMethod;
      if (body.adminNotes     !== undefined) updates.admin_notes     = body.adminNotes;
    }

    if (body.specialRequests !== undefined) updates.special_requests = body.specialRequests;

    const { data, error } = await db
      .from(TABLES.BOOKINGS)
      .update(updates)
      .eq("id", id)
      .select("id, booking_ref, status, payment_status, updated_at")
      .single();

    if (error) {
      console.error("[bookings/[id] PATCH]", error.message);
      return Response.json({ error: "Update failed" }, { status: 500 });
    }

    // ── Fire-and-forget status-change emails ──────────────────────────────
    if (body.status === "confirmed") {
      const { data: full } = await db
        .from(TABLES.BOOKINGS)
        .select("*, hotels(name, city), rooms(name)")
        .eq("id", id)
        .single();
      if (full) {
        const hotel = Array.isArray(full.hotels) ? full.hotels[0] : full.hotels;
        const room  = Array.isArray(full.rooms)  ? full.rooms[0]  : full.rooms;
        const checkIn  = String(full.check_in);
        const checkOut = String(full.check_out);
        const nights   = Math.round(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
        );
        notify.bookingConfirmed({
          bookingRef:   full.booking_ref,
          guestName:    full.guest_name,
          guestEmail:   full.guest_email,
          hotelName:    hotel?.name ?? "",
          hotelCity:    hotel?.city ?? "",
          roomName:     room?.name  ?? "",
          checkIn,
          checkOut,
          nights,
          guestsCount:  full.guests_count,
          totalAmount:  full.total_amount,
          currency:     full.currency,
        });
      }
    } else if (body.status === "cancelled") {
      const { data: full } = await db
        .from(TABLES.BOOKINGS)
        .select("booking_ref, guest_name, guest_email, hotels(name)")
        .eq("id", id)
        .single();
      if (full) {
        const hotel = Array.isArray(full.hotels) ? full.hotels[0] : full.hotels;
        notify.bookingCancelled({
          bookingRef:  full.booking_ref,
          guestName:   full.guest_name,
          guestEmail:  full.guest_email,
          hotelName:   hotel?.name ?? "",
        }, body.adminNotes);
      }
    }

    return Response.json({ success: true, booking: data });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
