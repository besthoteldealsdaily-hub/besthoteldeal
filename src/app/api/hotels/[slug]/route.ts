import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import { generateSlug, ensureUniqueHotelSlug } from "@/lib/db";

type Params = { slug: string };

/**
 * GET /api/hotels/[slug]
 * Returns a single hotel by slug.
 * Public: only live/approved hotels. Owners see own hotel. Admins see all.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const user = await getAuthUser(request);
  const db = createServerClient();

  const { data: hotel, error } = await db
    .from(TABLES.HOTELS)
    .select("*, rooms(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !hotel) {
    return Response.json({ error: "Hotel not found" }, { status: 404 });
  }

  // Access control
  const isPublicVisible = ["approved", "live"].includes(hotel.status);
  const isOwner = user?.id === hotel.owner_id;
  const isAdmin = user?.role === "admin";

  if (!isPublicVisible && !isOwner && !isAdmin) {
    return Response.json({ error: "Hotel not found" }, { status: 404 });
  }

  return Response.json({ hotel });
}

/**
 * PATCH /api/hotels/[slug]
 * Updates a hotel listing.
 * - hotel_owner: can only update their own hotel (remains in pending/reviewing if currently live)
 * - admin: can update any field including status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["hotel_owner", "admin"]);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const db = createServerClient();

    // Fetch the hotel to verify ownership
    const { data: existing, error: fetchErr } = await db
      .from(TABLES.HOTELS)
      .select("id, owner_id, name, slug, status")
      .eq("slug", slug)
      .maybeSingle();

    if (fetchErr || !existing) {
      return Response.json({ error: "Hotel not found" }, { status: 404 });
    }

    // Ownership check for non-admin
    if (user!.role !== "admin" && existing.owner_id !== user!.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build update payload — only include provided fields
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const allowed = [
      "description", "short_description", "city", "country", "address",
      "latitude", "longitude", "stars", "hotel_type", "amenities", "images",
      "cover_image", "price_from", "currency", "affiliate_links",
      "commission_rate", "check_in_time", "check_out_time", "cancellation_policy",
      "near_haram", "distance_from_haram", "distance_from_center",
      "allow_inquiry", "phone",
    ];

    // Admin-only fields
    const adminOnly = ["status", "verified", "featured", "admin_notes", "rejected_reason"];

    for (const field of allowed) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (user!.role === "admin") {
      for (const field of adminOnly) {
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      }
    }

    // If name changed, regenerate slug
    if (body.name && body.name !== existing.name) {
      const base = generateSlug(body.name);
      updates.name = body.name.trim();
      updates.slug = await ensureUniqueHotelSlug(base, existing.id);
    }

    const { data, error } = await db
      .from(TABLES.HOTELS)
      .update(updates)
      .eq("id", existing.id)
      .select("id, slug, name, status")
      .single();

    if (error) {
      console.error("[hotels/[slug] PATCH]", error.message);
      return Response.json({ error: "Update failed" }, { status: 500 });
    }

    return Response.json({ success: true, hotel: data });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

/**
 * DELETE /api/hotels/[slug]
 * Permanently deletes a hotel. Admin only.
 * Cascades to rooms and room_availability via FK constraints.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["admin"]);
  if (authErr) return authErr;

  const db = createServerClient();
  const { error } = await db
    .from(TABLES.HOTELS)
    .delete()
    .eq("slug", slug);

  if (error) {
    console.error("[hotels/[slug] DELETE]", error.message);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }

  return Response.json({ success: true });
}
