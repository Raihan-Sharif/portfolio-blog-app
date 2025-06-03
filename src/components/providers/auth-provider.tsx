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

  // Cache management with more aggressive caching
  const userCacheRef = useRef<Map<string, User>>(new Map());
  const lastRefreshRef = useRef<number>(0);
  const lastFocusRefreshRef = useRef<number>(0);
  const refreshThrottleMs = 2000;
  const focusRefreshThrottleMs = 10 * 60 * 1000; // 10 minutes for focus refreshes
  const isRefreshingRef = useRef(false);

  // Function to get user details with role information
  const getUserDetails = useCallback(async (userId: string) => {
    try {
      // Check cache first with longer TTL
      const cached = userCacheRef.current.get(userId);
      if (cached && Date.now() - lastRefreshRef.current < 5 * 60 * 1000) {
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
          return cached || null; // Return cached if available
        }

        const userDetails = {
          id: userId,
          ...profile,
          role: "viewer",
        };

        userCacheRef.current.set(userId, userDetails);
        return userDetails;
      }

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

        userCacheRef.current.set(userId, userDetails);
        return userDetails;
      }

      // Fallback
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        return cached || null;
      }

      const userDetails = {
        id: userId,
        ...profile,
        role: "viewer",
      };

      userCacheRef.current.set(userId, userDetails);
      return userDetails;
    } catch (err) {
      console.error("Error in getUserDetails:", err);
      const cached = userCacheRef.current.get(userId);
      return cached || null;
    }
  }, []);

  // Silent refresh function - doesn't trigger loading states
  const silentRefreshUser = useCallback(async () => {
    const now = Date.now();
    if (
      now - lastRefreshRef.current < refreshThrottleMs ||
      isRefreshingRef.current
    ) {
      return;
    }

    isRefreshingRef.current = true;
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
      console.error("Error in silent refresh:", err);
      // Don't clear user state on silent refresh errors
    } finally {
      isRefreshingRef.current = false;
    }
  }, [getUserDetails]);

  // Public refresh function - can trigger loading for explicit refreshes
  const refreshUser = useCallback(async () => {
    const now = Date.now();
    if (
      now - lastRefreshRef.current < refreshThrottleMs ||
      isRefreshingRef.current
    ) {
      return;
    }

    isRefreshingRef.current = true;
    lastRefreshRef.current = now;

    try {
      setLoading(true); // Only show loading for explicit refreshes

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
      isRefreshingRef.current = false;
    }
  }, [getUserDetails]);

  // Initial setup - get session only once
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

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

  // Optimized tab focus handling - much less aggressive
  useEffect(() => {
    if (!authInitialized || !user) return;

    let focusTimeout: NodeJS.Timeout;

    const handleFocus = () => {
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }

      const now = Date.now();
      const timeSinceLastFocusRefresh = now - lastFocusRefreshRef.current;

      // Only refresh if it's been more than 10 minutes since last focus refresh
      // and the user session might be stale
      if (timeSinceLastFocusRefresh > focusRefreshThrottleMs) {
        focusTimeout = setTimeout(() => {
          lastFocusRefreshRef.current = now;
          // Use silent refresh to avoid loading states
          silentRefreshUser();
        }, 2000); // 2 second delay to avoid rapid refreshes
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !document.hidden && user) {
        handleFocus();
      }
    };

    // Only add listeners if user is logged in
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authInitialized, user, silentRefreshUser]);

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
          // Don't show loading for sign in as it's already handled elsewhere
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
          }
        }

        // For TOKEN_REFRESHED, silently update without loading states
        if (event === "TOKEN_REFRESHED" && session?.user && user) {
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
