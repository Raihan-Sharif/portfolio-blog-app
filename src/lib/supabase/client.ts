import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Keep your existing client configuration
export const supabase = createClientComponentClient({
  options: {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    global: {
      headers: {
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
    },
  },
});

// Enhanced helper for database operations with retry logic
export const withRetry = async <T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 3,
  delay = 1000
): Promise<{ data: T | null; error: any }> => {
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();

      // If we get data or a non-retryable error, return immediately
      if (result.data || (result.error && !shouldRetryError(result.error))) {
        return result;
      }

      lastError = result.error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      );
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetryError(error)) {
        break;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      );
    }
  }

  return { data: null, error: lastError };
};

// Determine if an error should trigger a retry
const shouldRetryError = (error: any): boolean => {
  if (!error) return false;

  // Retry on network errors
  if (error.name === "NetworkError" || error.message?.includes("fetch"))
    return true;

  // Retry on 5xx server errors and specific codes
  if (error.status >= 500) return true;
  if (error.code === "PGRST301") return true; // Connection error
  if (error.message?.includes("timeout")) return true;
  if (error.message?.includes("connection")) return true;

  // Don't retry auth errors (4xx)
  if (error.status >= 400 && error.status < 500) return false;

  return true;
};
