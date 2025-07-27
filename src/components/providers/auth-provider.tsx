// src/components/providers/auth-provider.tsx
"use client";

import { supabase } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface EnhancedUser extends User {
  full_name?: string;
  role?: string;
}

interface AuthContextType {
  user: EnhancedUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
  isAdmin: false,
  isEditor: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Simple role cache with localStorage
const ROLE_CACHE_KEY = "user_role_cache";
const ROLE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface RoleCache {
  role: string;
  timestamp: number;
  userId: string;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  // Simple role checking with fallback
  const checkUserRole = useCallback(async (userId: string): Promise<string> => {
    try {
      // Check cache first
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(ROLE_CACHE_KEY);
        if (cached) {
          const roleCache: RoleCache = JSON.parse(cached);
          if (
            roleCache.userId === userId &&
            Date.now() - roleCache.timestamp < ROLE_CACHE_DURATION
          ) {
            return roleCache.role;
          }
        }
      }

      // Try new function first, fallback to direct query
      let role = "viewer"; // Default role

      try {
        const { data, error } = await supabase.rpc("get_user_with_role", {
          p_user_id: userId,
        });

        if (!error && data && data.length > 0) {
          role = data[0].role_name || "viewer";
        } else {
          throw new Error("Function not found, using fallback");
        }
      } catch (funcError) {
        // Fallback to direct table query
        console.log("Using fallback role query");
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select(
            `
            roles (
              name
            )
          `
          )
          .eq("user_id", userId)
          .single();

        if (!roleError && roleData?.roles) {
          // Handle both object and array cases
          const roleObj = Array.isArray(roleData.roles)
            ? roleData.roles[0]
            : roleData.roles;
          role = roleObj?.name || "viewer";
        }
      }

      // Cache the result
      if (typeof window !== "undefined") {
        const roleCache: RoleCache = {
          role,
          timestamp: Date.now(),
          userId,
        };
        localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(roleCache));
      }

      return role;
    } catch (error) {
      console.error("Error checking user role:", error);
      return "viewer"; // Safe default
    }
  }, []);

  // Update user with role
  const updateUserWithRole = useCallback(
    async (sessionUser: User, currentSession: Session) => {
      try {
        // Get profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", sessionUser.id)
          .single();

        // Get user role
        const role = await checkUserRole(sessionUser.id);

        const enhancedUser: EnhancedUser = {
          ...sessionUser,
          full_name:
            profileData?.full_name ||
            sessionUser.user_metadata?.full_name ||
            sessionUser.user_metadata?.name ||
            null,
          role: role,
        };

        setUser(enhancedUser);
        setSession(currentSession);
        setIsAdmin(role === "admin");
        setIsEditor(role === "admin" || role === "editor");
      } catch (error) {
        console.error("Error updating user with role:", error);
        // Set user without role on error
        setUser({
          ...sessionUser,
          full_name: sessionUser.user_metadata?.full_name || null,
          role: "viewer",
        });
        setSession(currentSession);
        setIsAdmin(false);
        setIsEditor(false);
      }
    },
    [checkUserRole]
  );

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");

        // Get current session
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          if (mounted) {
            setUser(null);
            setSession(null);
            setIsAdmin(false);
            setIsEditor(false);
          }
          return;
        }

        if (initialSession?.user && mounted) {
          await updateUserWithRole(initialSession.user, initialSession);
          console.log("Auth initialized with user");
        } else if (mounted) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsEditor(false);
          console.log("Auth initialized without user");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsEditor(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [updateUserWithRole]);

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state change:", event);

      try {
        if (event === "SIGNED_IN" && newSession?.user) {
          await updateUserWithRole(newSession.user, newSession);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsEditor(false);

          // Clear caches
          if (typeof window !== "undefined") {
            localStorage.removeItem(ROLE_CACHE_KEY);
          }
        } else if (event === "TOKEN_REFRESHED" && newSession?.user) {
          // Update session but don't refetch user data unnecessarily
          setSession(newSession);
          console.log("Token refreshed");
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateUserWithRole]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!session?.user) return;

    try {
      await updateUserWithRole(session.user, session);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  }, [session, updateUserWithRole]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);

      // Clear caches
      if (typeof window !== "undefined") {
        localStorage.removeItem(ROLE_CACHE_KEY);
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
      }

      // Reset state
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsEditor(false);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    refreshUser,
    isAdmin,
    isEditor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
