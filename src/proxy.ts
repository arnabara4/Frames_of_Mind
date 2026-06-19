import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isOwner, isProtectedPath } from "@/lib/auth";

// Only these origins may call our /api/* backend from a browser.
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://frames-of-mind-blond.vercel.app",
  "https://pranavii.in",
  "https://www.pranavii.in",
]);

function corsResponse(res: NextResponse, origin: string) {
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Vary", "Origin");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "content-type, authorization");
  return res;
}

export async function proxy(request: NextRequest) {
  // ── CORS / origin allow-list for API routes ──
  if (request.nextUrl.pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    // No Origin header → same-origin / server-to-server call → allow.
    if (origin) {
      if (!ALLOWED_ORIGINS.has(origin)) {
        return new NextResponse("Forbidden origin", { status: 403 });
      }
      if (request.method === "OPTIONS") {
        return corsResponse(new NextResponse(null, { status: 204 }), origin);
      }
      return corsResponse(NextResponse.next({ request }), origin);
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Owner-only routes: new editor, edit pages, admin dashboard.
  if (isProtectedPath(request.nextUrl.pathname) && !isOwner(user)) {
    const url = request.nextUrl.clone();
    // Unauthenticated → login (with return path); wrong account → homepage.
    if (!user) {
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
    } else {
      url.pathname = "/";
      url.search = "";
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$).*)"],
};
