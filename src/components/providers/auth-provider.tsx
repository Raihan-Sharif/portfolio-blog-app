"use client";

import { supabase } from "@/lib/supabase/client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

  // Cache management
  const userCacheRef = useRef<Map<string, User>>(new Map());
  const lastRefreshRef = useRef<number>(0);
  const refreshThrottleMs = 2000; // Minimum time between refreshes

  // Function to get user details with role information
  const getUserDetails = useCallback(async (userId: string) => {
    try {
      // Check cache first
      const cached = userCacheRef.current.get(userId);
      if (cached && Date.now() - lastRefreshRef.current < 30000) {
        // 30 seconds cache
        return cached;
      }

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

        const userDetails = {
          id: userId,
          ...profile,
          role: "viewer", // Default role
        };

        // Cache the result
        userCacheRef.current.set(userId, userDetails);
        return userDetails;
      }

      // The function might return an array, so we take the first result
      if (data && data.length > 0) {
        const userWithRole = data[0];
        const userDetails = {
          id: userId,
          full_name: userWithRole.full_name,
          avatar_url: userWithRole.avatar_url,
          bio: userWithRole.bio,
          created_at: userWithRole.created_at,
          updated_at: userWithRole.updated_at,
          role: userWithRole.role_name,
        };

        // Cache the result
        userCacheRef.current.set(userId, userDetails);
        return userDetails;
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

      const userDetails = {
        id: userId,
        ...profile,
        role: "viewer", // Default role
      };

      // Cache the result
      userCacheRef.current.set(userId, userDetails);
      return userDetails;
    } catch (err) {
      console.error("Error in getUserDetails:", err);
      return null;
    }
  }, []);

  // Throttled refresh function
  const refreshUser = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < refreshThrottleMs) {
      return; // Skip if too soon
    }
    lastRefreshRef.current = now;

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
        userCacheRef.current.clear();
      }
    } catch (err) {
      console.error("Error refreshing user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [getUserDetails]);

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
  }, [getUserDetails]);

  // Simplified tab focus handling
  useEffect(() => {
    if (!authInitialized) return;

    let focusTimeout: NodeJS.Timeout;

    const handleFocus = () => {
      // Clear any existing timeout
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }

      // Only refresh if user exists and hasn't been refreshed recently
      focusTimeout = setTimeout(() => {
        if (user && Date.now() - lastRefreshRef.current > 60000) {
          // 1 minute threshold
          refreshUser();
        }
      }, 1000); // Small delay to avoid rapid refreshes
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    };

    // Add listeners
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authInitialized, user, refreshUser]);

  // Simplified auth state change listener
  useEffect(() => {
    if (!authInitialized) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

        // Only handle explicit sign out and sign in events
        if (event === "SIGNED_OUT") {
          setUser(null);
          userCacheRef.current.clear();
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

        // For TOKEN_REFRESHED, just silently update if needed
        if (event === "TOKEN_REFRESHED" && session?.user && user) {
          // Don't show loading for token refresh
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
  }, [authInitialized, user, getUserDetails]);

  // Simple sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    userCacheRef.current.clear();
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
