import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, TABLES } from "@/lib/supabase";
import {
  AUTH_COOKIE_OPTS,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/auth";

/**
 * POST /api/auth/signin
 * Authenticates a user and sets HttpOnly auth cookies.
 * Works for all roles: customer, hotel_owner, admin.
 *
 * Body: { email, password }
 * Returns: { success, role, userId }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email:    email.toLowerCase().trim(),
      password,
    });

    if (error || !data.session) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Fetch role from users profile
    const db = createServerClient();
    const { data: profile } = await db
      .from(TABLES.USERS)
      .select("role, full_name")
      .eq("id", data.user.id)
      .maybeSingle();

    const response = NextResponse.json({
      success:  true,
      userId:   data.user.id,
      role:     profile?.role ?? "customer",
      fullName: profile?.full_name ?? null,
    });

    response.cookies.set(ACCESS_COOKIE_NAME, data.session.access_token, {
      ...AUTH_COOKIE_OPTS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    response.cookies.set(REFRESH_COOKIE_NAME, data.session.refresh_token, {
      ...AUTH_COOKIE_OPTS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return response;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
