import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if needed
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check for protected routes (admin and editor)
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Check for admin role
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", session.user.id)
      .single();

    if (!userRoles || !userRoles.roles || userRoles.roles.name !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith("/editor")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Check for editor or admin role
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", session.user.id)
      .single();

    if (
      !userRoles ||
      !userRoles.roles ||
      (userRoles.roles.name !== "editor" && userRoles.roles.name !== "admin")
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/editor/:path*",
    "/api/admin/:path*",
    "/api/editor/:path*",
  ],
};
