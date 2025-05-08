import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define proper types for the role response
interface RoleData {
  name: string;
}

interface UserRolesResponse {
  roles: RoleData;
}

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

    // Use the properly typed check
    const roleData = userRoles as UserRolesResponse | null;
    if (!roleData || !roleData.roles || roleData.roles.name !== "admin") {
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

    // Use the properly typed check
    const roleData = userRoles as UserRolesResponse | null;
    if (
      !roleData ||
      !roleData.roles ||
      (roleData.roles.name !== "editor" && roleData.roles.name !== "admin")
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
