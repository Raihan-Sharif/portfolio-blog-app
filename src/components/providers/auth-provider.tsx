// src/components/providers/auth-provider.tsx
"use client";

import { useOnlineTracking } from "@/hooks/use-online-tracking";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: (User & { full_name?: string; role?: string }) | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<
    (User & { full_name?: string; role?: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  // Set up online tracking
  useOnlineTracking(user, {
    enabled: true,
    updateInterval: 30000, // 30 seconds
  });

  // Enhanced user role checking with caching
  const checkUserRole = useCallback(async (userId: string) => {
    try {
      // Check cache first
      const cacheKey = `user_role_${userId}`;
      const cachedRole = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
      const cacheTimeout = 10 * 60 * 1000; // 10 minutes

      if (
        cachedRole &&
        cacheTime &&
        Date.now() - parseInt(cacheTime) < cacheTimeout
      ) {
        return cachedRole;
      }

      // Fetch from database
      const { data, error } = await supabase.rpc("get_user_with_role", {
        p_user_id: userId,
      });

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      const role = data?.[0]?.role_name || null;

      // Cache the result
      if (role) {
        sessionStorage.setItem(cacheKey, role);
        sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
      }

      return role;
    } catch (error) {
      console.error("Error in checkUserRole:", error);
      return null;
    }
  }, []);

  // Refresh user data and role
  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        // Get additional user data from profiles table
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", currentUser.id)
          .single();

        // Get user role
        const role = await checkUserRole(currentUser.id);

        const enhancedUser = {
          ...currentUser,
          full_name:
            profileData?.full_name ||
            currentUser.user_metadata?.full_name ||
            null,
          role: role,
        };

        setUser(enhancedUser);
        setIsAdmin(role === "admin");
        setIsEditor(role === "admin" || role === "editor");
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsEditor(false);
        // Clear cache when user logs out
        const keys = Object.keys(sessionStorage);
        keys.forEach((key) => {
          if (key.startsWith("user_role_")) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
      setIsAdmin(false);
      setIsEditor(false);
    }
  }, [checkUserRole]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          // Get additional user data
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", session.user.id)
            .single();

          // Get user role
          const role = await checkUserRole(session.user.id);

          const enhancedUser = {
            ...session.user,
            full_name:
              profileData?.full_name ||
              session.user.user_metadata?.full_name ||
              null,
            role: role,
          };

          setUser(enhancedUser);
          setIsAdmin(role === "admin");
          setIsEditor(role === "admin" || role === "editor");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        // User signed in
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user.id)
          .single();

        const role = await checkUserRole(session.user.id);

        const enhancedUser = {
          ...session.user,
          full_name:
            profileData?.full_name ||
            session.user.user_metadata?.full_name ||
            null,
          role: role,
        };

        setUser(enhancedUser);
        setIsAdmin(role === "admin");
        setIsEditor(role === "admin" || role === "editor");
      } else if (event === "SIGNED_OUT") {
        // User signed out
        setUser(null);
        setIsAdmin(false);
        setIsEditor(false);

        // Clear all cached data
        const keys = Object.keys(sessionStorage);
        keys.forEach((key) => {
          if (key.startsWith("user_role_") || key.startsWith("user_session_")) {
            sessionStorage.removeItem(key);
          }
        });
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Token refreshed, update user data
        await refreshUser();
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkUserRole, refreshUser]);

  // Enhanced sign out function
  const signOut = useCallback(async () => {
    try {
      setLoading(true);

      // Clear all cached data first
      const keys = Object.keys(sessionStorage);
      keys.forEach((key) => {
        if (
          key.startsWith("user_role_") ||
          key.startsWith("user_session_") ||
          key.startsWith("admin_") ||
          key.startsWith("navbar_admin_")
        ) {
          sessionStorage.removeItem(key);
        }
      });

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }

      // Reset state
      setUser(null);
      setIsAdmin(false);
      setIsEditor(false);
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup online tracking on unmount
  useEffect(() => {
    return () => {
      // Cleanup function runs when component unmounts
      if (user) {
        // Optional: Send offline status (this might not work on page close)
        supabase.rpc("cleanup_online_users").catch(console.error);
      }
    };
  }, [user]);

  // Periodic cleanup of old online users (admin only)
  useEffect(() => {
    if (!isAdmin) return;

    const cleanupInterval = setInterval(() => {
      supabase.rpc("cleanup_online_users").catch(console.error);
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [isAdmin]);

  const value: AuthContextType = {
    user,
    loading,
    signOut,
    refreshUser,
    isAdmin,
    isEditor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
