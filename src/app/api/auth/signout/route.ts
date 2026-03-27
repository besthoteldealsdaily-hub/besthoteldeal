import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth";

/**
 * POST /api/auth/signout
 * Clears auth cookies, ending the session.
 * No body required. Safe to call even when already signed out.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  const cookieOpts = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path:     "/",
    maxAge:   0,  // Immediately expire
  };

  response.cookies.set(ACCESS_COOKIE_NAME,  "", cookieOpts);
  response.cookies.set(REFRESH_COOKIE_NAME, "", cookieOpts);

  return response;
}
