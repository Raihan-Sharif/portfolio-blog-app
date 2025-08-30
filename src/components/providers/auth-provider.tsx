"use client";

import { createClient } from "@/utils/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  
  const initialized = useRef(false);
  const lastVisibilityRefresh = useRef(0);
  const visibilityHandlerRunning = useRef(false);
  const supabase = createClient();

  // Simplified role fetching
  const getUserRole = useCallback(async (userId: string): Promise<string> => {
    try {
      console.log("🔍 STARTING role fetch for user:", userId);
      console.log("📡 About to call supabase.rpc('get_user_with_role')");
      
      // Try RPC first - let's add more debugging
      const rpcStart = performance.now();
      const rpcResult = await supabase.rpc("get_user_with_role", {
        p_user_id: userId,
      });
      const rpcEnd = performance.now();
      
      console.log("📊 RPC call completed in", rpcEnd - rpcStart, "ms");
      console.log("📊 RPC result:", rpcResult);
      
      const { data: rpcData, error: rpcError } = rpcResult;

      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log("✅ SUCCESS: Got role from RPC:", rpcData[0].role_name);
        return rpcData[0].role_name || "viewer";
      }

      console.log("⚠️ RPC failed or returned no data:", { error: rpcError, data: rpcData });

      // Fallback to direct query
      console.log("🔄 Falling back to direct user_roles query");
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", userId)
        .maybeSingle();

      console.log("📊 Direct query result:", { data: roleData, error: roleError });

      if (!roleError && roleData?.roles) {
        const roleObj = Array.isArray(roleData.roles) ? roleData.roles[0] : roleData.roles;
        const roleName = (roleObj as any)?.name || "viewer";
        console.log("✅ Got role from direct query:", roleName);
        return roleName;
      }

      console.log("⚠️ No role found anywhere, defaulting to viewer");
      return "viewer";
    } catch (error) {
      console.error("❌ EXCEPTION in getUserRole:", error);
      return "viewer";
    }
  }, [supabase]);

  // Enhanced user with profile and role
  const createEnhancedUser = useCallback(async (authUser: User): Promise<EnhancedUser> => {
    try {
      console.log("👤 Creating enhanced user for:", authUser.id);
      
      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", authUser.id)
        .maybeSingle();

      console.log("📋 Profile data:", profile);

      // Get role - This will call the RPC function
      const role = await getUserRole(authUser.id);
      console.log("👥 Final role assigned:", role);

      const enhancedUser = {
        ...authUser,
        full_name: profile?.full_name ||
                   authUser.user_metadata?.full_name ||
                   authUser.user_metadata?.name ||
                   authUser.email?.split('@')[0] ||
                   'User',
        role,
      };

      console.log("✨ Enhanced user created:", { id: enhancedUser.id, name: enhancedUser.full_name, role: enhancedUser.role });
      return enhancedUser;
    } catch (error) {
      console.error("❌ Error creating enhanced user:", error);
      return {
        ...authUser,
        full_name: authUser.user_metadata?.full_name ||
                   authUser.user_metadata?.name ||
                   authUser.email?.split('@')[0] ||
                   'User',
        role: "viewer",
      };
    }
  }, [supabase, getUserRole]);

  // Set auth state
  const setAuthState = useCallback((authUser: User | null, authSession: Session | null, enhancedUser?: EnhancedUser) => {
    if (authUser && authSession) {
      const finalUser = enhancedUser || {
        ...authUser,
        full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
        role: 'viewer'
      };
      
      setUser(finalUser);
      setSession(authSession);
      setIsAdmin(finalUser.role === "admin");
      setIsEditor(finalUser.role === "admin" || finalUser.role === "editor");
    } else {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsEditor(false);
    }
  }, []);

  // Initialize auth
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      try {
        setLoading(true);
        
        // First check if we have a session
        const { data: { session: authSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setAuthState(null, null);
          return;
        }

        if (!authSession) {
          // No session exists, user is not authenticated
          console.log("🔔 Auth state changed: INITIAL_SESSION User ID: undefined");
          setAuthState(null, null);
          return;
        }

        // If we have a session, get the user
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !authUser) {
          console.error("Auth initialization error:", userError);
          setAuthState(null, null);
          return;
        }

        // Create enhanced user
        const enhancedUser = await createEnhancedUser(authUser);
        setAuthState(authUser, authSession, enhancedUser);

      } catch (error) {
        console.error("Auth initialization failed:", error);
        setAuthState(null, null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [supabase, setAuthState, createEnhancedUser]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      console.log("🔔 Auth state changed:", event, "User ID:", authSession?.user?.id);

      // Check if visibility handler is currently running - if so, skip this to avoid race condition
      if (visibilityHandlerRunning.current) {
        console.log("⏸️ Visibility handler is running - skipping auth state change to prevent race condition");
        return;
      }

      if (event === "SIGNED_OUT" || !authSession?.user) {
        console.log("🚪 Signing out - clearing auth state");
        setAuthState(null, null);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        console.log("🔄 Processing auth change event:", event);
        
        // Always use getUser() for the most current user data
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error || !authUser) {
          console.error("❌ Error getting user in auth change:", error);
          setAuthState(null, null);
          return;
        }

        if (event === "TOKEN_REFRESHED") {
          // For token refresh, just update session
          console.log("🔄 Token refreshed - updating session only");
          setSession(authSession);
        } else {
          // For other events, refresh user data
          console.log("🔄 Auth event requires user data refresh - calling createEnhancedUser");
          try {
            const enhancedUser = await createEnhancedUser(authUser);
            setAuthState(authUser, authSession, enhancedUser);
            console.log("✅ Auth state updated from auth change event");
          } catch (error) {
            console.error("❌ Error in auth change enhanced user creation:", error);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, setAuthState, createEnhancedUser]);

  // Handle tab switching
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && !loading) {
        // Throttle: Only refresh if it's been more than 2 seconds since last refresh
        const now = Date.now();
        if (now - lastVisibilityRefresh.current < 2000) {
          console.log("⏳ Skipping visibility refresh (throttled)");
          return;
        }
        lastVisibilityRefresh.current = now;
        
        console.log("👁️ Tab became visible - refreshing auth state");
        
        // Set flag to prevent auth state change interference
        visibilityHandlerRunning.current = true;
        
        try {
          // Verify auth state when tab becomes visible
          const { data: { user: currentUser }, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error("❌ Visibility check error:", error);
            if (user) setAuthState(null, null);
            return;
          }

          const hadUser = !!user;
          const hasUser = !!currentUser;

          if (hadUser !== hasUser) {
            if (hasUser) {
              // User signed in on another tab
              console.log("🔄 User signed in on another tab");
              const { data: { session: currentSession } } = await supabase.auth.getSession();
              if (currentSession) {
                const enhancedUser = await createEnhancedUser(currentUser);
                setAuthState(currentUser, currentSession, enhancedUser);
              }
            } else {
              // User signed out on another tab
              console.log("🚪 User signed out on another tab");
              setAuthState(null, null);
            }
          } else if (hasUser && currentUser) {
            // Same user is still logged in - refresh their data including role
            console.log("🔄 Same user detected - refreshing profile and role data (calling get_user_with_role)");
            console.log("📊 Current user ID:", currentUser.id);
            
            const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
            console.log("📋 Session check result:", { hasSession: !!currentSession, error: sessionError });
            
            if (currentSession) {
              console.log("✅ Session valid - creating enhanced user");
              try {
                // Always refresh user data when tab becomes visible to get latest role info
                const enhancedUser = await createEnhancedUser(currentUser);
                console.log("🎯 About to set auth state with enhanced user");
                setAuthState(currentUser, currentSession, enhancedUser);
                console.log("✅ Auth state updated successfully from visibility handler");
              } catch (error) {
                console.error("❌ Error in visibility change enhanced user creation:", error);
              }
            } else {
              console.log("❌ No valid session found during visibility change");
            }
          }
        } finally {
          // Always clear the flag, even if there was an error
          visibilityHandlerRunning.current = false;
          console.log("🏁 Visibility handler completed - flag cleared");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [supabase, user, loading, setAuthState, createEnhancedUser]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        console.error("Error refreshing user:", userError);
        return;
      }

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !currentSession) {
        console.error("Error refreshing session:", sessionError);
        return;
      }

      const enhancedUser = await createEnhancedUser(currentUser);
      setAuthState(currentUser, currentSession, enhancedUser);
    } catch (error) {
      console.error("Error in refreshUser:", error);
    }
  }, [supabase, setAuthState, createEnhancedUser]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
      }

      setAuthState(null, null);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, setAuthState]);

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