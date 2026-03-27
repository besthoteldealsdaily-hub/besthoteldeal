import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ACCESS_COOKIE  = "sb_access_token";
const REFRESH_COOKIE = "sb_refresh_token";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;

  // Sign out from Supabase (invalidates the token server-side)
  if (accessToken) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      await supabase.auth.admin.signOut(accessToken);
    } catch {
      // non-critical — clear cookies regardless
    }
  }

  const response = NextResponse.json({ success: true });
  const clear = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/", maxAge: 0 };
  response.cookies.set(ACCESS_COOKIE,  "", clear);
  response.cookies.set(REFRESH_COOKIE, "", clear);
  return response;
}
