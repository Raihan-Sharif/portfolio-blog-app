import { createClient as createBrowserClient } from '@/utils/supabase/client'

// Re-export the utils version for backward compatibility
export { createClient } from '@/utils/supabase/client'

// Utility functions using the browser client
export async function signOut() {
  const supabase = createBrowserClient();
  
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
}

// Legacy export for backwards compatibility
export const supabase = createBrowserClient();