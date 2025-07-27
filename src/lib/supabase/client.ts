// src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Simple, reliable Supabase client configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic refresh but don't be aggressive about it
    autoRefreshToken: true,
    // Persist session in local storage for reliability
    persistSession: true,
    // Detect session in URL for auth redirects
    detectSessionInUrl: true,
    // Use PKCE flow for better security
    flowType: "pkce",
    // Set reasonable storage key
    storageKey: "sb-auth-token",
  },
  // Set global headers for identification
  global: {
    headers: {
      "X-Client-Info": "portfolio-app",
    },
  },
});

/**
 * Get the current session with basic error handling
 */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error);
      return { data: { session: null }, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error("Exception getting session:", error);
    return { data: { session: null }, error };
  }
};

/**
 * Get the current user with basic error handling
 */
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error);
      return null;
    }
    return user;
  } catch (error) {
    console.error("Exception getting user:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data } = await getSession();
    return !!data.session?.user;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

/**
 * Sign out with proper cleanup
 */
export const signOut = async () => {
  try {
    // Clear any local caches
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_role_cache");
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Exception in signOut:", error);
    throw error;
  }
};
