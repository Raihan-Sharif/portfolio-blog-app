// src/components/providers/auth-provider.tsx
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

  // Function to refresh user data with optimized caching
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);

      // Add timestamp to avoid browser caching the request
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.session?.user) {
        // Store session in localStorage for cross-tab synchronization
        localStorage.setItem(
          "authSession",
          JSON.stringify({
            timestamp: Date.now(),
            userId: sessionData.session.user.id,
            email: sessionData.session.user.email,
          })
        );

        const userDetails = await getUserDetails(sessionData.session.user.id);

        if (userDetails) {
          const updatedUser = {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            ...userDetails,
          };

          setUser(updatedUser);

          // Store user details in localStorage
          localStorage.setItem(
            "authUserDetails",
            JSON.stringify({
              timestamp: Date.now(),
              user: updatedUser,
            })
          );
        } else {
          setUser({
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            role: "viewer", // Ensure a default role is set
          });
        }
      } else {
        setUser(null);
        // Clear stored session data
        localStorage.removeItem("authSession");
        localStorage.removeItem("authUserDetails");
      }
    } catch (err) {
      console.error("Error refreshing user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cross-tab communication
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "authSession" || event.key === "authUserDetails") {
        // Refresh user data when auth data changes in another tab
        refreshUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshUser]);

  // Initial setup of auth state with caching
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

        // Try to use cached data first for immediate display
        const cachedUserDetails = localStorage.getItem("authUserDetails");
        if (cachedUserDetails) {
          try {
            const parsed = JSON.parse(cachedUserDetails);
            // Only use cache if it's fresh (less than 5 minutes old)
            if (
              parsed.timestamp &&
              Date.now() - parsed.timestamp < 5 * 60 * 1000
            ) {
              setUser(parsed.user);
              setLoading(false);
            }
          } catch (e) {
            console.error("Error parsing cached user details:", e);
          }
        }

        // Still get fresh data from the server
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          // Store session data for cross-tab communication
          localStorage.setItem(
            "authSession",
            JSON.stringify({
              timestamp: Date.now(),
              userId: data.session.user.id,
              email: data.session.user.email,
            })
          );

          const userDetails = await getUserDetails(data.session.user.id);

          if (userDetails) {
            const updatedUser = {
              id: data.session.user.id,
              email: data.session.user.email,
              ...userDetails,
            };

            setUser(updatedUser);

            // Update cached user details
            localStorage.setItem(
              "authUserDetails",
              JSON.stringify({
                timestamp: Date.now(),
                user: updatedUser,
              })
            );
          } else {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email,
              role: "viewer",
            });
          }
        } else {
          setUser(null);
          // Clear cached data if not authenticated
          localStorage.removeItem("authSession");
          localStorage.removeItem("authUserDetails");
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

    // Handle tab/window focus events to refresh authentication
    const handleFocus = () => {
      if (authInitialized) {
        refreshUser();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshUser, authInitialized]);

  // Set up auth state change listener with improved handling
  useEffect(() => {
    if (!authInitialized) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

        setLoading(true);

        if (session?.user) {
          // Update stored session data
          localStorage.setItem(
            "authSession",
            JSON.stringify({
              timestamp: Date.now(),
              userId: session.user.id,
              email: session.user.email,
            })
          );

          const userDetails = await getUserDetails(session.user.id);

          if (userDetails) {
            const updatedUser = {
              id: session.user.id,
              email: session.user.email,
              ...userDetails,
            };

            setUser(updatedUser);

            // Update cached user details
            localStorage.setItem(
              "authUserDetails",
              JSON.stringify({
                timestamp: Date.now(),
                user: updatedUser,
              })
            );
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email,
              role: "viewer",
            });
          }
        } else {
          setUser(null);
          // Clear cached data
          localStorage.removeItem("authSession");
          localStorage.removeItem("authUserDetails");
        }

        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [authInitialized]);

  // Sign out function with improved cross-tab handling
  const signOut = useCallback(async () => {
    setLoading(true);

    // Clear cached data first for immediate UI feedback
    localStorage.removeItem("authSession");
    localStorage.removeItem("authUserDetails");

    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);

    // Broadcast a custom event to notify other tabs
    window.localStorage.setItem("authSignOut", Date.now().toString());
  }, []);

  // Create a stable context value
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
