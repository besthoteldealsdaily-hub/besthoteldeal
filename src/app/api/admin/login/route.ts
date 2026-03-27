import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ACCESS_COOKIE  = "sb_access_token";
const REFRESH_COOKIE = "sb_refresh_token";
const IS_PROD        = process.env.NODE_ENV === "production";
const ACCESS_MAX_AGE = 60 * 60;          // 1 hour (matches Supabase default)
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    const cookieOpts = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "strict" as const,
      path: "/",
    };

    response.cookies.set(ACCESS_COOKIE,  data.session.access_token,  { ...cookieOpts, maxAge: ACCESS_MAX_AGE });
    response.cookies.set(REFRESH_COOKIE, data.session.refresh_token, { ...cookieOpts, maxAge: REFRESH_MAX_AGE });

    return response;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
