import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * This runs on the server for every request to /admin/*.
 * It is the actual security boundary — a user cannot get past this by
 * editing JavaScript in their browser, hiding a button, or calling
 * localStorage.setItem("isAdmin", "true"). Access is decided here, from
 * the verified Supabase session + the role stored in the database.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!user) {
    if (isLoginPage) return response;
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Look up the caller's role in our own table — never trust a role claimed
  // by the client. profiles.id is a foreign key to auth.users.id.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  if (isLoginPage) {
    if (isAdmin) return NextResponse.redirect(new URL("/admin", request.url));
    return response;
  }

  if (!isAdmin) {
    return NextResponse.redirect(new URL("/admin/login?error=not_admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
