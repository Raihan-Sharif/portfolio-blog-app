// src/lib/auth-utils.ts
import { supabase } from "./supabase/client";

/**
 * Simplified authentication utilities
 */

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresVerification?: boolean;
}

/**
 * Enhanced sign in with better error handling
 */
export async function signInWithPassword({
  email,
  password,
}: SignInCredentials): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      // Handle specific error types
      switch (error.message) {
        case "Invalid login credentials":
          return { success: false, error: "Invalid email or password" };
        case "Email not confirmed":
          return {
            success: false,
            error: "Please verify your email address before signing in",
          };
        case "Too many requests":
          return {
            success: false,
            error: "Too many attempts. Please try again later",
          };
        default:
          return { success: false, error: error.message };
      }
    }

    if (!data.user) {
      return { success: false, error: "Sign in failed" };
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error("Sign in error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Enhanced sign up with profile creation and role assignment
 */
export async function signUpWithPassword({
  email,
  password,
  fullName,
}: SignUpData): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      switch (error.message) {
        case "User already registered":
          return {
            success: false,
            error: "An account with this email already exists",
          };
        case "Password should be at least 6 characters":
          return {
            success: false,
            error: "Password must be at least 6 characters long",
          };
        default:
          return { success: false, error: error.message };
      }
    }

    if (!data.user) {
      return { success: false, error: "Sign up failed" };
    }

    // If user is created but needs email confirmation
    if (!data.session) {
      return {
        success: true,
        user: data.user,
        requiresVerification: true,
      };
    }

    // If user is immediately signed in, ensure profile exists
    if (data.session && data.user) {
      try {
        // Check if profile was created by database trigger
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();

        // If profile doesn't exist, create it manually
        if (profileCheckError && profileCheckError.code === "PGRST116") {
          const { error: profileCreateError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              full_name: fullName.trim(),
              email: email.trim().toLowerCase(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (profileCreateError) {
            console.error("Profile creation error:", profileCreateError);
            // Don't fail signup if profile creation fails
          }
        }

        // Ensure user has viewer role by default
        const { data: existingRole, error: roleCheckError } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", data.user.id)
          .single();

        if (roleCheckError && roleCheckError.code === "PGRST116") {
          // Get viewer role ID
          const { data: viewerRole } = await supabase
            .from("roles")
            .select("id")
            .eq("name", "viewer")
            .single();

          if (viewerRole) {
            const { error: roleAssignError } = await supabase
              .from("user_roles")
              .insert({
                user_id: data.user.id,
                role_id: viewerRole.id,
                created_at: new Date().toISOString(),
              });

            if (roleAssignError) {
              console.error("Role assignment error:", roleAssignError);
              // Don't fail signup if role assignment fails
            }
          }
        }
      } catch (profileError) {
        console.error("Post-signup profile setup error:", profileError);
        // Don't fail the signup, just log the error
      }
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during sign up",
    };
  }
}

/**
 * Enhanced password reset
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Password reset error:", error);
    return { success: false, error: "Failed to send reset email" };
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
