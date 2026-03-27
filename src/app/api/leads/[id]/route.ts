import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";

type Params = { id: string };

/**
 * PATCH /api/leads/[id]
 * Updates a lead's status and admin notes.
 * hotel_owner: can update leads for their own hotels.
 * admin: can update any lead.
 *
 * Body: { status?, adminNotes?, forwardedAt? }
 * Valid statuses: new → contacted → qualified → converted | lost
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

    const { data: lead } = await db
      .from(TABLES.LEADS)
      .select("id, hotel_id, hotel_slug")
      .eq("id", id)
      .maybeSingle();

    if (!lead) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    // hotel_owner access check
    if (user!.role === "hotel_owner") {
      const { data: ownerHotels } = await db
        .from(TABLES.HOTELS)
        .select("id, slug")
        .eq("owner_id", user!.id);

      const ownerHotelIds   = ownerHotels?.map((h) => h.id)   ?? [];
      const ownerHotelSlugs = ownerHotels?.map((h) => h.slug)  ?? [];

      const ownedByHotelId   = lead.hotel_id   && ownerHotelIds.includes(lead.hotel_id);
      const ownedByHotelSlug = lead.hotel_slug && ownerHotelSlugs.includes(lead.hotel_slug);

      if (!ownedByHotelId && !ownedByHotelSlug) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const validStatuses = ["new", "contacted", "qualified", "converted", "lost"];
    if (body.status && !validStatuses.includes(body.status)) {
      return Response.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status      !== undefined) updates.status       = body.status;
    if (body.adminNotes  !== undefined) updates.admin_notes  = body.adminNotes;
    if (body.forwardedAt !== undefined) updates.forwarded_at = body.forwardedAt;

    const { data, error } = await db
      .from(TABLES.LEADS)
      .update(updates)
      .eq("id", id)
      .select("id, status, admin_notes, forwarded_at, updated_at")
      .single();

    if (error) {
      console.error("[leads/[id] PATCH]", error.message);
      return Response.json({ error: "Update failed" }, { status: 500 });
    }

    return Response.json({ success: true, lead: data });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
