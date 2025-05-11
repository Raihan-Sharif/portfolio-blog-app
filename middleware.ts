// Enhance src/middleware.ts
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

    // Get all user roles
    const { data: userRoles, error: userRolesError } = await supabase
      .from("user_roles")
      .select("role_id, roles(name)")
      .eq("user_id", session.user.id);

    if (userRolesError) {
      console.error("Error fetching user roles:", userRolesError);
      return NextResponse.redirect(new URL("/", req.url));
    }

    // If no roles or empty array, redirect to home
    if (!userRoles || userRoles.length === 0) {
      console.log("No roles found for user");
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Check if user has admin role
    const isAdmin = userRoles.some(
      (ur) => ur.roles && ur.roles.name === "admin"
    );

    if (!isAdmin) {
      console.log("User does not have admin role");
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith("/editor")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Check for editor or admin role
    const { data: userRoles, error: userRolesError } = await supabase
      .from("user_roles")
      .select("role_id, roles(name)")
      .eq("user_id", session.user.id);

    if (userRolesError || !userRoles || userRoles.length === 0) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Check if user has admin or editor role
    const hasEditAccess = userRoles.some(
      (ur) =>
        ur.roles && (ur.roles.name === "admin" || ur.roles.name === "editor")
    );

    if (!hasEditAccess) {
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
