import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";

type Params = { id: string };

/**
 * GET /api/admin/users/[id]
 * Returns a single user's profile plus their hotels and booking summary.
 * Admin only.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["admin"]);
  if (authErr) return authErr;

  const db = createServerClient();

  const [
    { data: profile },
    { data: hotels },
    { count: bookingCount },
    { count: leadCount },
  ] = await Promise.all([
    db.from(TABLES.USERS).select("*").eq("id", id).maybeSingle(),
    db.from(TABLES.HOTELS).select("id, slug, name, city, status, listing_type").eq("owner_id", id),
    db.from(TABLES.BOOKINGS).select("*", { count: "exact", head: true }).eq("user_id", id),
    db.from(TABLES.LEADS).select("*", { count: "exact", head: true }).eq("user_id", id),
  ]);

  if (!profile) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({
    user:          profile,
    hotels:        hotels ?? [],
    bookingCount:  bookingCount ?? 0,
    leadCount:     leadCount    ?? 0,
  });
}

/**
 * PATCH /api/admin/users/[id]
 * Updates a user's role or profile. Admin only.
 * Common use: promote a user to hotel_owner after approving their application.
 *
 * Body: { role?, fullName?, phone? }
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
    const { role, fullName, phone } = body;

    const validRoles = ["customer", "hotel_owner", "admin"];
    if (role && !validRoles.includes(role)) {
      return Response.json(
        { error: `role must be one of: ${validRoles.join(", ")}` },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (role      !== undefined) updates.role      = role;
    if (fullName  !== undefined) updates.full_name = fullName.trim();
    if (phone     !== undefined) updates.phone     = phone?.trim() ?? null;

    if (Object.keys(updates).length === 1) {
      return Response.json({ error: "No updatable fields provided" }, { status: 400 });
    }

    const db = createServerClient();
    const { data, error } = await db
      .from(TABLES.USERS)
      .update(updates)
      .eq("id", id)
      .select("id, email, full_name, role, updated_at")
      .single();

    if (error) {
      console.error("[admin/users/[id] PATCH]", error.message);
      return Response.json({ error: "Update failed" }, { status: 500 });
    }

    return Response.json({ success: true, user: data });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Deletes a user account. Admin only.
 * Deletes both the Supabase Auth user and the users profile row.
 * Cascades: hotels set owner_id = NULL, bookings set user_id = NULL.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["admin"]);
  if (authErr) return authErr;

  // Prevent self-deletion
  if (id === user!.id) {
    return Response.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const db = createServerClient();

  // Delete from Supabase Auth (cascades to users table via FK)
  const { error } = await db.auth.admin.deleteUser(id);
  if (error) {
    console.error("[admin/users/[id] DELETE]", error.message);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }

  return Response.json({ success: true });
}
