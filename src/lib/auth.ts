import { createServerSupabaseClient } from "@/lib/supabase/server";

export const UserRole = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
};

interface RoleData {
  name: string;
}

export async function getUserRole() {
  const supabase = createServerSupabaseClient() as any;

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  // Get the user's role
  const { data, error } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", session.user.id)
    .single();

  if (error || !data || !data.roles) {
    return null;
  }

  // Handle data.roles which could be an object or array
  let roleName = null;

  // If roles is an object with a name property
  if (
    typeof data.roles === "object" &&
    data.roles !== null &&
    "name" in data.roles
  ) {
    roleName = (data.roles as RoleData).name;
  }
  // If roles is an array with objects that have name property
  else if (
    Array.isArray(data.roles) &&
    data.roles.length > 0 &&
    typeof data.roles[0] === "object" &&
    data.roles[0] !== null &&
    "name" in data.roles[0]
  ) {
    roleName = (data.roles[0] as RoleData).name;
  }

  if (!roleName) {
    return null;
  }

  return roleName;
}

export async function hasRequiredRole(requiredRole: string) {
  const userRole = await getUserRole();

  if (!userRole) {
    return false;
  }

  // Role hierarchy: ADMIN > EDITOR > VIEWER
  if (requiredRole === UserRole.VIEWER) {
    return true; // All authenticated users have at least VIEWER role
  }

  if (requiredRole === UserRole.EDITOR) {
    return userRole === UserRole.EDITOR || userRole === UserRole.ADMIN;
  }

  if (requiredRole === UserRole.ADMIN) {
    return userRole === UserRole.ADMIN;
  }

  return false;
}
