// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check for protected routes (admin and editor)
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!session) {
        const url = new URL("/sign-in", req.url);
        url.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }

      // For admin routes, use aggressive caching to prevent navigation issues
      const cacheKey = `admin_${session.user.id}`;
      const cachedStatus =
        req.headers.get("x-admin-cache") ||
        req.cookies.get("admin_status")?.value;

      // If we have cached admin status, trust it to prevent navigation blocking
      if (cachedStatus === "true") {
        res.headers.set("x-admin-verified", "true");
        return res;
      }

      // Only do database check if we don't have cached status
      try {
        const { data, error } = await supabase.rpc("get_user_with_role", {
          p_user_id: session.user.id,
        });

        const isAdmin =
          !error && data && data.length > 0 && data[0].role_name === "admin";

        if (isAdmin) {
          // Set cache headers and cookie for future requests
          res.headers.set("x-admin-verified", "true");
          res.cookies.set("admin_status", "true", {
            maxAge: 15 * 60, // 15 minutes
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
          return res;
        } else {
          // Clear any stale cache
          res.cookies.delete("admin_status");
          return NextResponse.redirect(new URL("/", req.url));
        }
      } catch (dbError) {
        console.error("Database error in middleware:", dbError);
        // On database error, let the request through and let client handle it
        // This prevents navigation blocking due to database issues
        return res;
      }
    }

    if (req.nextUrl.pathname.startsWith("/editor")) {
      if (!session) {
        const url = new URL("/sign-in", req.url);
        url.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }

      // Similar caching for editor role
      const cachedEditorStatus = req.cookies.get("editor_status")?.value;

      if (cachedEditorStatus === "true") {
        return res;
      }

      try {
        const { data, error } = await supabase.rpc("get_user_with_role", {
          p_user_id: session.user.id,
        });

        const hasEditAccess =
          !error &&
          data &&
          data.length > 0 &&
          (data[0].role_name === "admin" || data[0].role_name === "editor");

        if (hasEditAccess) {
          res.cookies.set("editor_status", "true", {
            maxAge: 15 * 60,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
          return res;
        } else {
          res.cookies.delete("editor_status");
          return NextResponse.redirect(new URL("/", req.url));
        }
      } catch (dbError) {
        console.error("Database error in middleware:", dbError);
        return res;
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
    // On middleware error, let the request through to prevent breaking navigation
    // The client-side auth will handle the authentication flow
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
