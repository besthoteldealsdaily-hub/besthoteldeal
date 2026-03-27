import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "customer" | "hotel_owner" | "admin";

export interface AuthUser {
  id:        string;
  email:     string;
  role:      UserRole;
  full_name: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCESS_COOKIE = "sb_access_token";

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * Extracts and verifies the caller's identity from:
 *  1. The sb_access_token HttpOnly cookie (browser sessions)
 *  2. The Authorization: Bearer <token> header (mobile / server-to-server)
 *
 * Returns null if the token is absent, expired, or invalid.
 * Never throws — safe to call unconditionally at the top of any route handler.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token =
    request.cookies.get(ACCESS_COOKIE)?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  try {
    // Validate JWT against Supabase Auth (anon key — token verification only)
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: { user }, error } = await anonClient.auth.getUser(token);
    if (error || !user) return null;

    // Fetch role from the users profile table via service role (bypasses RLS)
    const db = createServerClient();
    const { data: profile } = await db
      .from("users")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    return {
      id:        user.id,
      email:     user.email!,
      role:      (profile?.role as UserRole) ?? "customer",
      full_name: profile?.full_name ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Returns a 401 or 403 Response if the auth check fails, otherwise null.
 *
 * Usage pattern in route handlers:
 *   const user = await getAuthUser(request);
 *   const err  = requireRole(user, ["admin", "hotel_owner"]);
 *   if (err) return err;
 *   // ... proceed with user guaranteed to be authenticated + authorized
 */
export function requireRole(
  user: AuthUser | null,
  roles?: UserRole[],
): Response | null {
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (roles && !roles.includes(user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/**
 * Cookie configuration for auth tokens.
 * Exported so both signin and signup routes use identical settings.
 */
export const AUTH_COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path:     "/",
};

export const ACCESS_TOKEN_MAX_AGE  = 60 * 60;           // 1 hour
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;  // 7 days
export const ACCESS_COOKIE_NAME    = ACCESS_COOKIE;
export const REFRESH_COOKIE_NAME   = "sb_refresh_token";
