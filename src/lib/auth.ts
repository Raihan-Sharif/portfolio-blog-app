import { createServerSupabaseClient } from "@/lib/supabase/server";

export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
}

export async function getUserRole() {
  const supabase = createServerSupabaseClient();

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

  return data.roles.name as UserRole;
}

export async function hasRequiredRole(requiredRole: UserRole) {
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
