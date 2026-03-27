import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import { parsePagination, paginationMeta, isValidEmail, areDatesValid } from "@/lib/db";
import { notify } from "@/lib/notifications";

/**
 * POST /api/leads
 * Submits a guest inquiry for a hotel that uses lead-gen or affiliate model.
 * Public — no account required.
 *
 * This is the primary capture point for WhatsApp leads, inquiry forms, and
 * any contact request that doesn't flow through the direct booking system.
 *
 * Body: { hotelSlug, hotelName, guestName, guestEmail, guestPhone?,
 *         checkIn?, checkOut?, guestsCount?, budgetRange?,
 *         specialRequests?, source? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hotelSlug, hotelName, guestName, guestEmail, guestPhone,
      checkIn, checkOut, guestsCount, budgetRange, specialRequests,
      source, channel,
    } = body;

    // ── Validation ───────────────────────────────────────────────────────────
    if (!hotelName || !guestName || !guestEmail) {
      return Response.json(
        { error: "hotelName, guestName, and guestEmail are required" },
        { status: 400 },
      );
    }

    if (!isValidEmail(guestEmail)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (checkIn && checkOut && !areDatesValid(checkIn, checkOut)) {
      return Response.json(
        { error: "checkOut must be after checkIn" },
        { status: 400 },
      );
    }

    const db = createServerClient();

    // Optionally resolve hotel_id from the slug if it exists in our DB
    let hotelId: string | null = null;
    if (hotelSlug) {
      const { data: hotel } = await db
        .from(TABLES.HOTELS)
        .select("id")
        .eq("slug", hotelSlug)
        .maybeSingle();
      hotelId = hotel?.id ?? null;
    }

    // Optional: link to authenticated user
    const user = await getAuthUser(request);

    const validSources = ["website", "whatsapp", "phone", "email", "partner"];
    const { data: lead, error } = await db
      .from(TABLES.LEADS)
      .insert({
        hotel_id:        hotelId,
        hotel_name:      hotelName.trim(),
        hotel_slug:      hotelSlug       ?? null,
        user_id:         user?.id        ?? null,
        guest_name:      guestName.trim(),
        guest_email:     guestEmail.toLowerCase().trim(),
        guest_phone:     guestPhone      ?? null,
        check_in:        checkIn         ?? null,
        check_out:       checkOut        ?? null,
        guests_count:    guestsCount     ?? 1,
        budget_range:    budgetRange     ?? null,
        special_requests: specialRequests ?? null,
        source:          validSources.includes(source) ? source : "website",
        channel:         channel         ?? null,
        status:          "new",
      })
      .select("id, status, created_at")
      .single();

    if (error) {
      console.error("[leads POST]", error.message);
      return Response.json({ error: "Failed to submit inquiry" }, { status: 500 });
    }

    // ── Fire-and-forget email notifications ─────────────────────────────────
    notify.leadReceived({
      leadId:          lead.id,
      guestName:       guestName.trim(),
      guestEmail:      guestEmail.toLowerCase().trim(),
      guestPhone:      guestPhone      ?? undefined,
      hotelName:       hotelName.trim(),
      hotelSlug:       hotelSlug       ?? undefined,
      checkIn:         checkIn         ?? undefined,
      checkOut:        checkOut        ?? undefined,
      guestsCount:     guestsCount     ?? undefined,
      budgetRange:     budgetRange     ?? undefined,
      specialRequests: specialRequests ?? undefined,
      source:          validSources.includes(source) ? source : "website",
    });

    return Response.json(
      {
        success:  true,
        leadId:   lead.id,
        message:  "Inquiry received. The hotel team will contact you within 24 hours.",
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

/**
 * GET /api/leads
 * Lists leads, scoped by role.
 *   hotel_owner → leads for their hotels only
 *   admin       → all leads (with optional filters)
 *
 * Query params: status, hotel_slug, source, from, to, page, limit
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["hotel_owner", "admin"]);
  if (authErr) return authErr;

  const { searchParams } = request.nextUrl;
  const pagination = parsePagination(searchParams);
  const db = createServerClient();

  let query = db
    .from(TABLES.LEADS)
    .select(
      `id, hotel_name, hotel_slug, hotel_id, guest_name, guest_email,
       guest_phone, check_in, check_out, guests_count, budget_range,
       special_requests, source, channel, status, admin_notes,
       forwarded_at, created_at`,
      { count: "exact" },
    );

  // ── Role-based scope ───────────────────────────────────────────────────────
  if (user!.role === "hotel_owner") {
    const { data: ownerHotels } = await db
      .from(TABLES.HOTELS)
      .select("id, slug")
      .eq("owner_id", user!.id);

    if (!ownerHotels || ownerHotels.length === 0) {
      return Response.json({ leads: [], meta: paginationMeta(0, pagination) });
    }

    const hotelIds   = ownerHotels.map((h) => h.id);
    const hotelSlugs = ownerHotels.map((h) => h.slug).filter(Boolean);

    // Match by hotel_id OR hotel_slug (leads may come in before hotel is in DB)
    query = query.or(
      `hotel_id.in.(${hotelIds.join(",")}),hotel_slug.in.(${hotelSlugs.join(",")})`,
    );
  }

  // ── Optional filters ───────────────────────────────────────────────────────
  const status    = searchParams.get("status");
  const hotelSlug = searchParams.get("hotel_slug");
  const source    = searchParams.get("source");
  const from      = searchParams.get("from");
  const to        = searchParams.get("to");

  if (status)    query = query.eq("status", status);
  if (hotelSlug) query = query.eq("hotel_slug", hotelSlug);
  if (source)    query = query.eq("source", source);
  if (from)      query = query.gte("created_at", from);
  if (to)        query = query.lte("created_at", to);

  query = query
    .order("created_at", { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[leads GET]", error.message);
    return Response.json({ error: "Failed to fetch leads" }, { status: 500 });
  }

  return Response.json({
    leads: data ?? [],
    meta:  paginationMeta(count ?? 0, pagination),
  });
}
