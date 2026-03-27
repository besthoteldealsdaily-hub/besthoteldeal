import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";

/**
 * Direct booking inquiry endpoint.
 * Called by the BookingFormClient for hotels with listingType: 'direct'.
 * Stores the inquiry and notifies the hotel owner (email integration: future).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hotelSlug, hotelName, city, country, roomId,
      guestName, guestEmail, guestPhone,
      checkIn, checkOut, guests, rooms, specialRequests,
    } = body;

    if (!hotelSlug || !guestName || !guestEmail || !checkIn || !checkOut) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!guestEmail.includes("@")) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      return Response.json({ error: "Check-out must be after check-in" }, { status: 400 });
    }

    const db = createServerClient();

    const { data, error } = await db.from(TABLES.BOOKING_INQUIRIES).insert({
      hotel_slug:       hotelSlug,
      hotel_name:       hotelName       || null,
      city:             city            || null,
      country:          country         || null,
      room_id:          roomId          || null,
      guest_name:       guestName,
      guest_email:      guestEmail.toLowerCase().trim(),
      guest_phone:      guestPhone      || null,
      check_in:         checkIn,
      check_out:        checkOut,
      guests:           guests          || 1,
      rooms:            rooms           || 1,
      special_requests: specialRequests || null,
      status:           "new",
      channel:          "web",
      created_at:       new Date().toISOString(),
    }).select("id").single();

    if (error) {
      console.error("[book/inquiry] Supabase error:", error.message);
      return Response.json({ error: "Failed to submit inquiry" }, { status: 500 });
    }

    return Response.json({
      success:   true,
      inquiryId: data?.id,
      message:   "Inquiry received — the hotel team will contact you within 24 hours.",
    });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
