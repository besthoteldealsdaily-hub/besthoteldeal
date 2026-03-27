import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";

/**
 * Partner onboarding endpoint.
 * Receives hotel listing applications from property owners.
 * Creates a 'pending' record for admin review.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hotelName, ownerName, ownerEmail, ownerPhone,
      city, country, stars, description,
      priceFrom, currency, website, message,
    } = body;

    if (!hotelName || !ownerName || !ownerEmail || !city) {
      return Response.json({ error: "Missing required fields: hotelName, ownerName, ownerEmail, city" }, { status: 400 });
    }

    if (!ownerEmail.includes("@")) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    const db = createServerClient();

    const { error } = await db.from(TABLES.PARTNER_APPLICATIONS).insert({
      hotel_name:  hotelName,
      owner_name:  ownerName,
      owner_email: ownerEmail.toLowerCase().trim(),
      owner_phone: ownerPhone  || null,
      city,
      country:     country     || null,
      stars:       stars       || null,
      description: description || null,
      price_from:  priceFrom   || null,
      currency:    currency    || "USD",
      website:     website     || null,
      message:     message     || null,
      status:      "pending",
      created_at:  new Date().toISOString(),
    });

    if (error) {
      console.error("[partner] Supabase error:", error.message);
      return Response.json({ error: "Failed to submit application" }, { status: 500 });
    }

    return Response.json({ success: true, message: "Application received — we'll be in touch within 2 business days." });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
