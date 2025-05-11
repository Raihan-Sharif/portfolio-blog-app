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

    // Use our RPC function to check role
    const { data, error } = await supabase.rpc("get_user_with_role", {
      p_user_id: session.user.id,
    });

    if (error) {
      console.error("Middleware error checking admin role:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Check if user has admin role
    const isAdmin = data && data.length > 0 && data[0].role_name === "admin";

    if (!isAdmin) {
      console.log("User does not have admin role");
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith("/editor")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Use our RPC function to check role
    const { data, error } = await supabase.rpc("get_user_with_role", {
      user_id: session.user.id,
    });

    if (error) {
      console.error("Middleware error checking editor role:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Check if user has admin or editor role
    const hasEditAccess =
      data &&
      data.length > 0 &&
      (data[0].role_name === "admin" || data[0].role_name === "editor");

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
