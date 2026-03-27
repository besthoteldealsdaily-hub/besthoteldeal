import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";

/**
 * WhatsApp lead tracking endpoint.
 * Called client-side before opening a WhatsApp deep link for luxury/lead hotels.
 * Logs the lead for attribution and CRM — non-blocking (fire-and-forget).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelSlug, hotelName, dealSlug, city, country, pricePoint, currency, sourcePage } = body;

    if (!hotelSlug) {
      return Response.json({ logged: false }, { status: 400 });
    }

    const db = createServerClient();

    const { error } = await db.from(TABLES.WHATSAPP_LEADS).insert({
      hotel_slug:  hotelSlug,
      hotel_name:  hotelName  || null,
      deal_slug:   dealSlug   || null,
      city:        city       || null,
      country:     country    || null,
      price_point: pricePoint || null,
      currency:    currency   || null,
      source_page: sourcePage || null,
      user_agent:  request.headers.get("user-agent") || "",
      referrer:    request.headers.get("referer")    || null,
      created_at:  new Date().toISOString(),
    });

    if (error) {
      console.error("[whatsapp] Supabase error:", error.message);
    }

    // Always return success — lead capture is non-critical
    return Response.json({ logged: !error });
  } catch {
    return Response.json({ logged: false }, { status: 200 });
  }
}
