import { NextRequest } from "next/server";
import { createServerClient, TABLES } from "@/lib/supabase";
import { getAuthUser, requireRole } from "@/lib/auth";
import { parsePagination, paginationMeta, isValidEmail } from "@/lib/db";

/**
 * GET /api/admin/users
 * Lists all registered users. Admin only.
 *
 * Query params: role, search (name/email), page, limit
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["admin"]);
  if (authErr) return authErr;

  const { searchParams } = request.nextUrl;
  const pagination = parsePagination(searchParams);
  const db = createServerClient();

  let query = db
    .from(TABLES.USERS)
    .select(
      "id, email, full_name, phone, role, nationality, avatar_url, created_at, updated_at",
      { count: "exact" },
    );

  const role   = searchParams.get("role");
  const search = searchParams.get("search");

  if (role)   query = query.eq("role", role);
  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

  query = query
    .order("created_at", { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[admin/users GET]", error.message);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return Response.json({
    users: data ?? [],
    meta:  paginationMeta(count ?? 0, pagination),
  });
}

/**
 * POST /api/admin/users
 * Admin creates a user account directly (bypasses email confirmation).
 * Useful for onboarding hotel partners without requiring self-registration.
 *
 * Body: { email, password, fullName, phone?, role }
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  const authErr = requireRole(user, ["admin"]);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { email, password, fullName, phone, role } = body;

    if (!email || !password || !fullName || !role) {
      return Response.json(
        { error: "email, password, fullName, and role are required" },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    const validRoles = ["customer", "hotel_owner", "admin"];
    if (!validRoles.includes(role)) {
      return Response.json(
        { error: `role must be one of: ${validRoles.join(", ")}` },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const db = createServerClient();

    // Use the Admin API to create the user (bypasses email verification)
    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email:            email.toLowerCase().trim(),
      password,
      email_confirm:    true,    // skip email verification
      user_metadata:    { full_name: fullName },
    });

    if (authError || !authData.user) {
      const msg = authError?.message ?? "User creation failed";
      return Response.json(
        { error: msg.includes("already registered") ? "Email already in use" : msg },
        { status: 400 },
      );
    }

    // Insert user profile row
    const { data: profile, error: profileError } = await db
      .from(TABLES.USERS)
      .insert({
        id:        authData.user.id,
        email:     email.toLowerCase().trim(),
        full_name: fullName.trim(),
        phone:     phone?.trim() ?? null,
        role,
      })
      .select("id, email, full_name, role")
      .single();

    if (profileError) {
      console.error("[admin/users POST] profile insert:", profileError.message);
    }

    return Response.json(
      { success: true, user: profile ?? { id: authData.user.id, email, role } },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
