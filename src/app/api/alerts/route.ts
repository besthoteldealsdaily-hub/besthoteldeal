import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";

/**
 * Price alert subscription endpoint.
 * Stores email + city/hotel preferences for price drop notifications.
 *
 * Unique constraint on (email, city, hotel_slug) prevents duplicates —
 * returns success for both new and existing subscriptions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, city, hotelSlug, maxPrice, currency } = body;

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!city) {
      return Response.json({ error: "City is required" }, { status: 400 });
    }

    const db = createServerClient();

    const { error } = await db.from(TABLES.PRICE_ALERTS).insert({
      email:      email.toLowerCase().trim(),
      city,
      hotel_slug: hotelSlug || null,
      max_price:  maxPrice  || null,
      currency:   currency  || "USD",
      active:     true,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // 23505 = unique_violation — already subscribed
      if (error.code === "23505") {
        return Response.json({ success: true, message: "Already subscribed" });
      }
      console.error("[alerts] Supabase error:", error.message);
      return Response.json({ error: "Failed to subscribe" }, { status: 500 });
    }

    return Response.json({ success: true, message: "Subscribed to price alerts" });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
