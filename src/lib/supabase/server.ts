import { createServerClient } from '@supabase/ssr'
// Re-export the utils version for backward compatibility
export { createClient } from '@/utils/supabase/server'

/**
 * Enhanced admin client with proper error handling and retry logic
 */
class SupabaseAdminClient {
  private client: any;
  private isInitialized = false;

  constructor() {
    this.client = this.createClient();
  }

  private createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error(
        "Missing Supabase environment variables for admin client"
      );
    }

    return createServerClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "portfolio-app-admin",
        },
      },
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Admin client doesn't use cookies
        },
      },
    });
  }

  /**
   * Get the admin client instance
   */
  getInstance() {
    if (!this.isInitialized) {
      this.isInitialized = true;
      console.log("Admin Supabase client initialized");
    }
    return this.client;
  }

  /**
   * Execute a query with retry logic and error handling
   */
  async executeWithRetry<T>(
    operation: (client: any) => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation(this.client);
      } catch (error) {
        lastError = error as Error;
        console.error(
          `Admin operation failed (attempt ${attempt + 1}):`,
          error
        );

        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Safely get user with role
   */
  async getUserWithRole(userId: string) {
    return this.executeWithRetry(async (client) => {
      const { data, error } = await client.rpc("get_user_with_role", {
        p_user_id: userId,
      });

      if (error) {
        throw new Error(`Failed to get user role: ${error.message}`);
      }

      return data;
    });
  }

  /**
   * Safely update user role
   */
  async updateUserRole(userId: string, roleId: number) {
    return this.executeWithRetry(async (client) => {
      const { data, error } = await client.rpc("upsert_user_role", {
        p_user_id: userId,
        p_role_id: roleId,
      });

      if (error) {
        throw new Error(`Failed to update user role: ${error.message}`);
      }

      return data;
    });
  }

  /**
   * Safely delete user
   */
  async deleteUser(userId: string) {
    return this.executeWithRetry(async (client) => {
      const { data, error } = await client.rpc("delete_user_safely", {
        p_user_id: userId,
      });

      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }

      return data;
    });
  }

  /**
   * Get all users with roles (admin operation)
   */
  async getAllUsersWithRoles() {
    return this.executeWithRetry(async (client) => {
      // First get profiles
      const { data: profiles, error: profilesError } = await client
        .from("profiles")
        .select("id, full_name, created_at");

      if (profilesError) {
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      // Then get user roles
      const { data: userRoles, error: rolesError } = await client.from(
        "user_roles"
      ).select(`
          user_id,
          role_id,
          roles(id, name)
        `);

      if (rolesError) {
        throw new Error(`Failed to fetch user roles: ${rolesError.message}`);
      }

      // Combine the data
      const combinedUsers = profiles.map((profile: any) => {
        const userRole = userRoles.find((ur: any) => ur.user_id === profile.id);

        return {
          id: profile.id,
          full_name: profile.full_name,
          created_at: profile.created_at,
          role: (userRole?.roles as any)?.name || "No role",
          role_id: (userRole?.roles as any)?.id || 0,
        };
      });

      return combinedUsers;
    });
  }
}

// Create singleton instance
const adminClientInstance = new SupabaseAdminClient();

/**
 * Get the admin Supabase client instance
 */
export const supabaseAdmin = adminClientInstance.getInstance();

/**
 * Get the admin client with enhanced methods
 */
export const getAdminClient = () => adminClientInstance;

/**
 * Verify server-side session with enhanced error handling
 */
export async function verifyServerSession() {
  try {
    const { createClient } = require('@/utils/supabase/server');
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Server session verification error:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error verifying server session:", error);
    return null;
  }
}

/**
 * Get current user on server with enhanced error handling
 */
export async function getCurrentServerUser() {
  try {
    const { createClient } = require('@/utils/supabase/server');
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting server user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error in getCurrentServerUser:", error);
    return null;
  }
}

/**
 * Check if user has required role on server
 */
export async function hasServerRole(requiredRole: string) {
  try {
    const session = await verifyServerSession();
    if (!session?.user) {
      return false;
    }

    const userData = await adminClientInstance.getUserWithRole(session.user.id);
    const userRole = (userData as any)?.[0]?.role_name;

    if (!userRole) {
      return false;
    }

    // Role hierarchy check
    switch (requiredRole.toLowerCase()) {
      case "admin":
        return userRole === "admin";
      case "editor":
        return userRole === "admin" || userRole === "editor";
      case "viewer":
        return true; // All authenticated users are at least viewers
      default:
        return false;
    }
  } catch (error) {
    console.error("Error checking server role:", error);
    return false;
  }
}

/**
 * Enhanced server-side auth guard
 */
export async function requireServerAuth(requiredRole?: string) {
  const session = await verifyServerSession();

  if (!session?.user) {
    throw new Error("Authentication required");
  }

  if (requiredRole) {
    const hasRole = await hasServerRole(requiredRole);
    if (!hasRole) {
      throw new Error(`${requiredRole} role required`);
    }
  }

  return session;
}

// Legacy exports for backward compatibility
export function createServerSupabaseClient() {
  const { createClient } = require('@/utils/supabase/server');
  return createClient();
}