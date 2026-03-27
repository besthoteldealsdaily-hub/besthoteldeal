import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createServerClient, TABLES } from "@/lib/supabase";

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile.
 * Returns 401 if not signed in.
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch full profile from DB
  const db = createServerClient();
  const { data: profile, error } = await db
    .from(TABLES.USERS)
    .select("id, email, full_name, phone, role, avatar_url, nationality, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  return Response.json({ user: profile });
}

/**
 * PATCH /api/auth/me
 * Updates the current user's profile fields.
 * Allowed fields: fullName, phone, avatarUrl, nationality
 * Role cannot be changed via this endpoint.
 *
 * Body: { fullName?, phone?, avatarUrl?, nationality? }
 */
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fullName, phone, avatarUrl, nationality } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (fullName   !== undefined) updates.full_name   = fullName.trim();
    if (phone      !== undefined) updates.phone       = phone?.trim() ?? null;
    if (avatarUrl  !== undefined) updates.avatar_url  = avatarUrl ?? null;
    if (nationality !== undefined) updates.nationality = nationality ?? null;

    if (Object.keys(updates).length === 1) {
      return Response.json({ error: "No updatable fields provided" }, { status: 400 });
    }

    const db = createServerClient();
    const { data, error } = await db
      .from(TABLES.USERS)
      .update(updates)
      .eq("id", user.id)
      .select("id, email, full_name, phone, role, avatar_url, nationality")
      .single();

    if (error) {
      console.error("[auth/me PATCH]", error.message);
      return Response.json({ error: "Update failed" }, { status: 500 });
    }

    return Response.json({ success: true, user: data });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
