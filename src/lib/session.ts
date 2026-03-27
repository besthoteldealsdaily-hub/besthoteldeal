/**
 * Server-side session helpers.
 * Used by owner dashboard layouts and pages to validate the authenticated user.
 * Safe to call in any Server Component — reads HttpOnly cookies, never exposes tokens.
 */

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase";

export type UserRole = "customer" | "hotel_owner" | "admin";

export interface SessionUser {
  id:        string;
  email:     string;
  full_name: string | null;
  role:      UserRole;
}

/**
 * Returns the current authenticated user from the sb_access_token cookie.
 * Returns null if the token is absent, expired, or the user profile is missing.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb_access_token")?.value;
  if (!token) return null;

  try {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: { user }, error } = await anonClient.auth.getUser(token);
    if (error || !user) return null;

    const db = createServerClient();
    const { data: profile } = await db
      .from("users")
      .select("id, email, full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) return null;
    return profile as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Returns the session only if the user has one of the required roles.
 * Returns null if not authenticated or insufficient role.
 */
export async function requireSession(
  roles: UserRole[] = ["customer", "hotel_owner", "admin"],
): Promise<SessionUser | null> {
  const user = await getSession();
  if (!user) return null;
  if (!roles.includes(user.role)) return null;
  return user;
}
