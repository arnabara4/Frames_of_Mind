import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isOwner, isProtectedPath } from "@/lib/auth";

export async function proxy(request: NextRequest) {
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
