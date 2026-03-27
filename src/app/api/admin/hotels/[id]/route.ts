import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import { notify } from "@/lib/notifications";

type Params = { id: string };

/**
 * PATCH /api/admin/hotels/[id]
 * Admin workflow: approve, reject, or update any hotel listing.
 * Admin only.
 *
 * Body: { action: "approve" | "reject" | "update", notes?, rejectedReason?, ...fields }
 *
 * action=approve → status: "live", sets reviewed_at/reviewed_by
 * action=reject  → status: "rejected", requires rejectedReason
 * action=update  → update arbitrary fields (for corrections)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["admin"]);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { action, notes, rejectedReason } = body;

    const db = createServerClient();

    const { data: hotel } = await db
      .from(TABLES.HOTELS)
      .select("id, name, slug, status, owner_id, users!owner_id(full_name, email)")
      .eq("id", id)
      .maybeSingle();

    if (!hotel) {
      return Response.json({ error: "Hotel not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      updated_at:  new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: user!.email,
    };

    if (action === "approve") {
      updates.status      = "live";
      updates.admin_notes = notes ?? null;
    } else if (action === "reject") {
      if (!rejectedReason) {
        return Response.json(
          { error: "rejectedReason is required when rejecting a hotel" },
          { status: 400 },
        );
      }
      updates.status          = "rejected";
      updates.rejected_reason = rejectedReason;
      updates.admin_notes     = notes ?? null;
    } else if (action === "update" || !action) {
      // Generic field update — build from body excluding reserved fields
      const skipFields = new Set(["action", "notes", "rejectedReason"]);
      const editable = [
        "name", "description", "short_description", "city", "country", "stars",
        "hotel_type", "listing_type", "amenities", "cover_image", "images",
        "price_from", "currency", "commission_rate", "affiliate_links",
        "check_in_time", "check_out_time", "cancellation_policy",
        "near_haram", "distance_from_haram", "distance_from_center",
        "allow_inquiry", "verified", "featured", "admin_notes", "status",
      ];
      for (const field of editable) {
        if (!skipFields.has(field) && body[field] !== undefined) {
          updates[field] = body[field];
        }
      }
      if (notes !== undefined) updates.admin_notes = notes;
    } else {
      return Response.json(
        { error: "action must be 'approve', 'reject', or 'update'" },
        { status: 400 },
      );
    }

    const { data, error } = await db
      .from(TABLES.HOTELS)
      .update(updates)
      .eq("id", id)
      .select("id, slug, name, status, reviewed_at, reviewed_by")
      .single();

    if (error) {
      console.error("[admin/hotels/[id] PATCH]", error.message);
      return Response.json({ error: "Update failed" }, { status: 500 });
    }

    // ── Fire-and-forget owner notification ─────────────────────────────────
    if (action === "approve" || action === "reject") {
      const owner = Array.isArray(hotel.users) ? hotel.users[0] : hotel.users;
      if (owner?.email) {
        notify.hotelStatus({
          ownerName:       owner.full_name ?? "Hotel Owner",
          ownerEmail:      owner.email,
          hotelName:       hotel.name,
          hotelSlug:       hotel.slug,
          status:          action === "approve" ? "approved" : "rejected",
          rejectedReason:  rejectedReason ?? undefined,
          adminNotes:      notes          ?? undefined,
        });
      }
    }

    return Response.json({
      success: true,
      hotel:   data,
      message:
        action === "approve" ? `${hotel.name} is now live.`
        : action === "reject"  ? `${hotel.name} has been rejected.`
        : "Hotel updated.",
    });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
