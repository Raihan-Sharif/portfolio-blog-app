// src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Enhanced Supabase client configuration to prevent token revocation
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // CRITICAL: Configure for multi-tab stability
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    
    // FIXED: Prevent cross-tab conflicts with unique storage key
    storageKey: "sb-portfolio-auth-stable",
    
    // CRITICAL: Disable window focus refresh to prevent conflicts
    refetchOnWindowFocus: false,
    
    // FIXED: Optimized refresh settings
    // Refresh token 10 minutes before expiry (instead of 60 seconds)
    refreshMargin: 600, // 10 minutes in seconds
    
    // FIXED: Proper storage configuration
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null;
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return;
        try {
          localStorage.setItem(key, value);
        } catch {
          // Silently fail if storage is not available
        }
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return;
        try {
          localStorage.removeItem(key);
        } catch {
          // Silently fail if storage is not available
        }
      },
    },
    
    // FIXED: Disable debug in production to reduce log noise
    debug: false,
  },
  // Optimized global headers
  global: {
    headers: {
      "X-Client-Info": "portfolio-stable-v3",
    },
  },
  // Database connection settings
  db: {
    schema: "public",
  },
  // Optimized realtime settings
  realtime: {
    params: {
      eventsPerSecond: 5, // Reduced to prevent conflicts
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
