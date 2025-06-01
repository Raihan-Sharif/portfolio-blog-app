import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Get session with minimal refresh to avoid tab conflicts
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check for protected routes (admin and editor)
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!session) {
        const url = new URL("/sign-in", req.url);
        // Add a redirect parameter to return to this page after login
        url.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }

      // Use cached role check to avoid database calls on every request
      const cacheKey = `admin_status_${session.user.id}`;

      // Try to get cached admin status from headers (if set by client)
      const cachedStatus = req.headers.get("x-admin-status");

      if (cachedStatus === "true") {
        return res;
      }

      // Only check database if we don't have cached status
      try {
        const { data, error } = await supabase.rpc("get_user_with_role", {
          p_user_id: session.user.id,
        });

        if (error) {
          console.error("Middleware error checking admin role:", error);
          return NextResponse.redirect(new URL("/", req.url));
        }

        // Check if user has admin role
        const isAdmin =
          data && data.length > 0 && data[0].role_name === "admin";

        if (!isAdmin) {
          console.log("User does not have admin role");
          return NextResponse.redirect(new URL("/", req.url));
        }

        // Set cache header for subsequent requests
        res.headers.set("x-admin-status", "true");
      } catch (dbError) {
        console.error("Database error in middleware:", dbError);
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith("/editor")) {
      if (!session) {
        const url = new URL("/sign-in", req.url);
        url.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }

      // Similar caching for editor role
      const cachedEditorStatus = req.headers.get("x-editor-status");

      if (cachedEditorStatus === "true") {
        return res;
      }

      try {
        const { data, error } = await supabase.rpc("get_user_with_role", {
          p_user_id: session.user.id,
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

        res.headers.set("x-editor-status", "true");
      } catch (dbError) {
        console.error("Database error in middleware:", dbError);
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Check for profile page
    if (req.nextUrl.pathname.startsWith("/profile")) {
      if (!session) {
        const url = new URL("/sign-in", req.url);
        url.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, allow the request to proceed but redirect admin/editor routes
    if (
      req.nextUrl.pathname.startsWith("/admin") ||
      req.nextUrl.pathname.startsWith("/editor")
    ) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    return res;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/editor/:path*",
    "/profile/:path*",
    "/profile",
    "/api/admin/:path*",
    "/api/editor/:path*",
  ],
};
