import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
};

// For admin operations that need service role
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);
