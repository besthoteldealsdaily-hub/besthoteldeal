import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";

/**
 * Newsletter subscription endpoint.
 * Called by the footer "Get Daily Deal Alerts" form.
 * Stores email with source tracking for segmented campaigns.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, cityInterest } = body;

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid email is required" }, { status: 400 });
    }

    const db = createServerClient();

    const { error } = await db.from(TABLES.NEWSLETTER).insert({
      email:         email.toLowerCase().trim(),
      source:        source       || "footer",
      city_interest: cityInterest || null,
      active:        true,
      created_at:    new Date().toISOString(),
    });

    if (error) {
      // 23505 = unique_violation — already subscribed, treat as success
      if (error.code === "23505") {
        return Response.json({ success: true, message: "You're already on the list!" });
      }
      console.error("[newsletter] Supabase error:", error.message);
      return Response.json({ error: "Failed to subscribe" }, { status: 500 });
    }

    return Response.json({ success: true, message: "You're on the list! Deals are on their way." });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
