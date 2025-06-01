"use client";

import { supabase } from "@/lib/supabase/client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { SessionManager } from "../../lib/utils";

type User = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Function to get user details with role information
  const getUserDetails = async (userId: string) => {
    try {
      // Call our custom function
      const { data, error } = await supabase.rpc("get_user_with_role", {
        p_user_id: userId,
      });

      if (error) {
        console.error("Error calling get_user_with_role:", error);

        // Fallback: just get the profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return null;
        }

        return {
          id: userId,
          ...profile,
          role: "viewer", // Default role
        };
      }

      // The function might return an array, so we take the first result
      if (data && data.length > 0) {
        const userWithRole = data[0];

        return {
          id: userId,
          full_name: userWithRole.full_name,
          avatar_url: userWithRole.avatar_url,
          bio: userWithRole.bio,
          created_at: userWithRole.created_at,
          updated_at: userWithRole.updated_at,
          role: userWithRole.role_name,
        };
      }

      // If no results, fall back to just getting the profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Fallback error fetching profile:", profileError);
        return null;
      }

      return {
        id: userId,
        ...profile,
        role: "viewer", // Default role
      };
    } catch (err) {
      console.error("Error in getUserDetails:", err);
      return null;
    }
  };

  // Simple refresh function - no cross-tab interference
  const refreshUser = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.session?.user) {
        const userDetails = await getUserDetails(sessionData.session.user.id);

        if (userDetails) {
          const updatedUser = {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            ...userDetails,
          };
          setUser(updatedUser);
        } else {
          setUser({
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            role: "viewer",
          });
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error refreshing user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial setup - get session only once
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const userDetails = await getUserDetails(session.user.id);

          if (userDetails) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              ...userDetails,
            });
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email,
              role: "viewer",
            });
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setUser(null);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    initAuth();
  }, []);

  // In the useEffect for initialization, add:
  useEffect(() => {
    const sessionManager = SessionManager.getInstance();

    const handleGentleRefresh = (event: CustomEvent) => {
      // Only handle refresh if this is the original tab
      if (sessionManager.isOriginal()) {
        refreshUser();
      }
    };

    window.addEventListener(
      "gentleAuthRefresh",
      handleGentleRefresh as EventListener
    );

    return () => {
      window.removeEventListener(
        "gentleAuthRefresh",
        handleGentleRefresh as EventListener
      );
    };
  }, [refreshUser]);

  // Auth state change listener - minimal handling
  useEffect(() => {
    if (!authInitialized) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

        // Only handle explicit sign out and sign in events
        if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
          return;
        }

        if (event === "SIGNED_IN" && session?.user) {
          setLoading(true);
          try {
            const userDetails = await getUserDetails(session.user.id);

            if (userDetails) {
              setUser({
                id: session.user.id,
                email: session.user.email,
                ...userDetails,
              });
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email,
                role: "viewer",
              });
            }
          } catch (err) {
            console.error("Error handling sign in:", err);
            setUser(null);
          } finally {
            setLoading(false);
          }
        }

        // For TOKEN_REFRESHED, just update the current user data silently
        if (event === "TOKEN_REFRESHED" && session?.user && user) {
          // Don't set loading true for token refresh - keep UI stable
          try {
            const userDetails = await getUserDetails(session.user.id);
            if (userDetails) {
              setUser((prev) => ({
                ...prev,
                id: session.user.id,
                email: session.user.email,
                ...userDetails,
              }));
            }
          } catch (err) {
            console.error("Error handling token refresh:", err);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [authInitialized, user]);

  // Simple sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  }, []);

  // Stable context value
  const contextValue = useMemo(
    () => ({
      user,
      loading,
      signOut,
      refreshUser,
    }),
    [user, loading, signOut, refreshUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
