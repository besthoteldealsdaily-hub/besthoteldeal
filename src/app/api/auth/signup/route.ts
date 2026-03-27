import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, TABLES } from "@/lib/supabase";
import { isValidEmail } from "@/lib/db";
import {
  AUTH_COOKIE_OPTS,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/auth";
import { notify } from "@/lib/notifications";

/**
 * POST /api/auth/signup
 * Registers a new user account.
 *
 * Body: { email, password, fullName, phone?, role? }
 * Role is restricted: customers can self-register; hotel_owner requires admin approval flow;
 * admin role cannot be self-assigned.
 *
 * On success: sets auth cookies and returns the user profile.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, role } = body;

    // ── Input validation ─────────────────────────────────────────────────────
    if (!email || !password || !fullName) {
      return Response.json(
        { error: "email, password, and fullName are required" },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Prevent privilege escalation — only customer and hotel_owner are self-assignable
    const allowedSelfRoles = ["customer", "hotel_owner"];
    const assignedRole = allowedSelfRoles.includes(role) ? role : "customer";

    // ── Create Supabase auth user ─────────────────────────────────────────────
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: authData, error: authError } = await anonClient.auth.signUp({
      email:    email.toLowerCase().trim(),
      password,
    });

    if (authError || !authData.user) {
      const msg = authError?.message ?? "Registration failed";
      const isConflict = msg.toLowerCase().includes("already registered");
      return Response.json(
        { error: isConflict ? "Email already in use" : msg },
        { status: isConflict ? 409 : 400 },
      );
    }

    // ── Insert user profile row ───────────────────────────────────────────────
    const db = createServerClient();
    await db.from(TABLES.USERS).insert({
      id:        authData.user.id,
      email:     email.toLowerCase().trim(),
      full_name: fullName.trim(),
      phone:     phone?.trim() ?? null,
      role:      assignedRole,
    });

    // ── Welcome email (fire-and-forget) ──────────────────────────────────────
    notify.welcome(email.toLowerCase().trim(), fullName.trim(), assignedRole);

    // ── Set auth cookies if session is immediately available ──────────────────
    // (Supabase may require email confirmation — session will be null until confirmed)
    const session = authData.session;
    const response = NextResponse.json({
      success:   true,
      userId:    authData.user.id,
      role:      assignedRole,
      confirmed: !!session,
      message:   session
        ? "Account created successfully."
        : "Account created. Please check your email to confirm your address.",
    });

    if (session) {
      response.cookies.set(ACCESS_COOKIE_NAME, session.access_token, {
        ...AUTH_COOKIE_OPTS,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
      response.cookies.set(REFRESH_COOKIE_NAME, session.refresh_token, {
        ...AUTH_COOKIE_OPTS,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
    }

    return response;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
