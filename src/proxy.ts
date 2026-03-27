import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ACCESS_COOKIE = "sb_access_token";

function makeSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/**
 * Proxy — two responsibilities:
 * 1. Stamp x-is-admin on every /admin/* response so root layout can hide Header/Footer.
 * 2. Protect /admin/* (except /admin/login) with Supabase session validation.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Not an admin route — pass through unchanged ──────────────────────────
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // ── All admin routes: stamp the header so root layout hides nav ──────────
  const baseResponse = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        "x-is-admin": "1",
      }),
    },
  });

  // ── Login page itself is always public ───────────────────────────────────
  if (pathname === "/admin/login" || pathname === "/admin/login/") {
    return baseResponse;
  }

  // ── Validate Supabase session ─────────────────────────────────────────────
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;

  if (accessToken) {
    try {
      const supabase = makeSupabase();
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      if (user) return baseResponse; // valid session → allow
    } catch {
      // fall through to redirect
    }
  }

  // ── No valid session → redirect to login ─────────────────────────────────
  const loginUrl = new URL("/admin/login/", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
