// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (reduced from 15)
const CACHE_HEADER_KEY = "x-auth-cache-time";

interface CachedAuthData {
  isAdmin: boolean;
  isEditor: boolean;
  timestamp: number;
  userId: string;
}

/**
 * Parse cached auth data from cookie
 */
function parseCachedAuthData(
  cookieValue: string | undefined
): CachedAuthData | null {
  if (!cookieValue) return null;

  try {
    const data = JSON.parse(decodeURIComponent(cookieValue));
    // Check if cache is still valid
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Create cached auth data cookie value
 */
function createCachedAuthData(
  userId: string,
  isAdmin: boolean,
  isEditor: boolean
): string {
  const data: CachedAuthData = {
    isAdmin,
    isEditor,
    timestamp: Date.now(),
    userId,
  };
  return encodeURIComponent(JSON.stringify(data));
}

/**
 * Check user role with error handling and retry logic
 */
async function checkUserRole(
  supabase: any,
  userId: string,
  retries = 2
): Promise<{ isAdmin: boolean; isEditor: boolean }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase.rpc("get_user_with_role", {
        p_user_id: userId,
      });

      if (error) {
        console.error(`Role check error (attempt ${attempt + 1}):`, error);
        if (attempt === retries) {
          throw error;
        }
        continue;
      }

      const roleName = data?.[0]?.role_name;
      return {
        isAdmin: roleName === "admin",
        isEditor: roleName === "admin" || roleName === "editor",
      };
    } catch (error) {
      console.error(`Role check failed (attempt ${attempt + 1}):`, error);
      if (attempt === retries) {
        // On final failure, assume no special privileges
        return { isAdmin: false, isEditor: false };
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }

  return { isAdmin: false, isEditor: false };
}

/**
 * Validate and refresh session if needed
 */
async function ensureValidSession(supabase: any) {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Session validation error:", error);
      return null;
    }

    if (!session) {
      return null;
    }

    // Check if session is close to expiry (within 5 minutes)
    const expiresAt = new Date(session.expires_at! * 1000).getTime();
    const now = Date.now();
    const timeToExpiry = expiresAt - now;

    if (timeToExpiry < 5 * 60 * 1000) {
      // Less than 5 minutes
      console.log("Session needs refresh in middleware");
      try {
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Token refresh failed in middleware:", refreshError);
          return session; // Return original session if refresh fails
        }
        return refreshData.session;
      } catch (refreshErr) {
        console.error("Token refresh error in middleware:", refreshErr);
        return session; // Return original session if refresh fails
      }
    }

    return session;
  } catch (error) {
    console.error("Session validation failed:", error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    // Create Supabase client for middleware
    const supabase = createMiddlewareClient({ req, res });

    // Validate and potentially refresh session
    const session = await ensureValidSession(supabase);

    // Handle admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!session) {
        const url = new URL("/sign-in", req.url);
        url.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }

      const userId = session.user.id;

      // Check for cached auth data
      const cachedAuthCookie = req.cookies.get("auth_status")?.value;
      const cachedData = parseCachedAuthData(cachedAuthCookie);

      // Use cache if valid and for same user
      if (cachedData && cachedData.userId === userId && cachedData.isAdmin) {
        res.headers.set("x-admin-verified", "true");
        res.headers.set(CACHE_HEADER_KEY, cachedData.timestamp.toString());
        return res;
      }

      // Check admin role from database
      try {
        const { isAdmin, isEditor } = await checkUserRole(supabase, userId);

        if (isAdmin) {
          // Set successful cache
          const cacheValue = createCachedAuthData(userId, isAdmin, isEditor);
          res.cookies.set("auth_status", cacheValue, {
            maxAge: CACHE_DURATION / 1000, // Convert to seconds
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", // Changed from strict to lax for better compatibility
            path: "/",
          });

          res.headers.set("x-admin-verified", "true");
          res.headers.set(CACHE_HEADER_KEY, Date.now().toString());
          return res;
        } else {
          // Clear any stale cache and redirect
          res.cookies.delete("auth_status");
          return NextResponse.redirect(new URL("/", req.url));
        }
      } catch (dbError) {
        console.error("Database error in admin middleware:", dbError);
        // On database error, check if we have valid cache to fall back to
        if (cachedData && cachedData.userId === userId) {
          console.log("Using cached auth data due to database error");
          res.headers.set("x-admin-verified", "true");
          res.headers.set("x-cache-fallback", "true");
          return res;
        }
        // Otherwise, redirect to home to prevent blocking
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Handle editor routes
    if (req.nextUrl.pathname.startsWith("/editor")) {
      if (!session) {
        const url = new URL("/sign-in", req.url);
        url.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }

      const userId = session.user.id;

      // Check for cached auth data
      const cachedAuthCookie = req.cookies.get("auth_status")?.value;
      const cachedData = parseCachedAuthData(cachedAuthCookie);

      // Use cache if valid and user has editor access
      if (cachedData && cachedData.userId === userId && cachedData.isEditor) {
        res.headers.set("x-editor-verified", "true");
        res.headers.set(CACHE_HEADER_KEY, cachedData.timestamp.toString());
        return res;
      }

      // Check editor role from database
      try {
        const { isAdmin, isEditor } = await checkUserRole(supabase, userId);

        if (isEditor) {
          // Set successful cache
          const cacheValue = createCachedAuthData(userId, isAdmin, isEditor);
          res.cookies.set("auth_status", cacheValue, {
            maxAge: CACHE_DURATION / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });

          res.headers.set("x-editor-verified", "true");
          res.headers.set(CACHE_HEADER_KEY, Date.now().toString());
          return res;
        } else {
          // Clear any stale cache and redirect
          res.cookies.delete("auth_status");
          return NextResponse.redirect(new URL("/", req.url));
        }
      } catch (dbError) {
        console.error("Database error in editor middleware:", dbError);
        // Fallback to cache if available
        if (cachedData && cachedData.userId === userId && cachedData.isEditor) {
          console.log("Using cached auth data due to database error");
          res.headers.set("x-editor-verified", "true");
          res.headers.set("x-cache-fallback", "true");
          return res;
        }
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Handle profile routes
    if (req.nextUrl.pathname.startsWith("/profile")) {
      if (!session) {
        const url = new URL("/sign-in", req.url);
        url.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }

    // Handle API routes that require admin access
    if (req.nextUrl.pathname.startsWith("/api/admin")) {
      if (!session) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      const userId = session.user.id;

      // For API routes, always check fresh (no caching for critical operations)
      try {
        const { isAdmin } = await checkUserRole(supabase, userId);

        if (!isAdmin) {
          return NextResponse.json(
            { error: "Admin access required" },
            { status: 403 }
          );
        }

        res.headers.set("x-admin-verified", "true");
        return res;
      } catch (error) {
        console.error("Error checking admin access for API:", error);
        return NextResponse.json(
          { error: "Authorization check failed" },
          { status: 500 }
        );
      }
    }

    // Handle API routes that require editor access
    if (req.nextUrl.pathname.startsWith("/api/editor")) {
      if (!session) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      const userId = session.user.id;

      try {
        const { isEditor } = await checkUserRole(supabase, userId);

        if (!isEditor) {
          return NextResponse.json(
            { error: "Editor access required" },
            { status: 403 }
          );
        }

        res.headers.set("x-editor-verified", "true");
        return res;
      } catch (error) {
        console.error("Error checking editor access for API:", error);
        return NextResponse.json(
          { error: "Authorization check failed" },
          { status: 500 }
        );
      }
    }

    // Add session info to response headers for debugging
    if (session) {
      res.headers.set("x-user-authenticated", "true");
      res.headers.set("x-user-id", session.user.id);
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);

    // For critical errors, clear any auth caches and let request through
    const res = NextResponse.next();
    res.cookies.delete("auth_status");
    res.headers.set("x-middleware-error", "true");

    // Only redirect to sign-in for protected routes if it's clearly an auth error
    if (
      req.nextUrl.pathname.startsWith("/admin") ||
      req.nextUrl.pathname.startsWith("/editor") ||
      req.nextUrl.pathname.startsWith("/profile")
    ) {
      const url = new URL("/sign-in", req.url);
      url.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return res;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/editor/:path*",
    "/profile/:path*",
    "/api/admin/:path*",
    "/api/editor/:path*",
  ],
};
