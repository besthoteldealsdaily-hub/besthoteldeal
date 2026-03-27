import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";

/**
 * Engagement tracking endpoint.
 * Records deal clicks, hotel views, and CTA interactions.
 * Powers smart sorting, trending badges, and partner analytics.
 *
 * Uses the service role client — tracking events bypass RLS
 * so they are never lost due to policy misconfiguration.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, dealSlug, hotelSlug, city, country, source, platform, referrer, sessionId } = body;

    if (!event) {
      return Response.json({ error: "Missing event type" }, { status: 400 });
    }

    const db = createServerClient();

    const { error } = await db.from(TABLES.ENGAGEMENT_EVENTS).insert({
      event_type:  event,
      deal_slug:   dealSlug  || null,
      hotel_slug:  hotelSlug || null,
      city:        city      || null,
      country:     country   || null,
      source:      source    || "web",
      platform:    platform  || "hotels",
      referrer:    referrer  || null,
      session_id:  sessionId || null,
      user_agent:  request.headers.get("user-agent") || "",
      created_at:  new Date().toISOString(),
    });

    if (error) {
      console.error("[track] Supabase error:", error.message);
      return Response.json({ tracked: false });
    }

    return Response.json({ tracked: true });
  } catch {
    // Tracking is non-critical — always return 200
    return Response.json({ tracked: false }, { status: 200 });
  }
}
