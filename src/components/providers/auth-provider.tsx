"use client";

import { supabase } from "@/lib/supabase/client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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

  const getUserDetails = async (userId: string) => {
    try {
      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return null;
      }

      // Get user role - modified query to handle no roles case
      let { data: userRoles, error: roleError } = await supabase
        .from("user_roles")
        .select("role_id, roles(name)")
        .eq("user_id", userId);

      // Fallback: If roles(name) is null, fetch role name manually
      if (
        userRoles &&
        userRoles.length > 0 &&
        (!userRoles[0].roles || !userRoles[0].roles.name)
      ) {
        userRoles = await Promise.all(
          userRoles.map(async (ur) => {
            const { data: roleRow } = await supabase
              .from("roles")
              .select("name")
              .eq("id", ur.role_id)
              .single();
            return { ...ur, roles: { name: roleRow?.name } };
          })
        );
      }

      // Default to viewer role
      let roleName = "viewer";

      if (roleError) {
        console.error("Error fetching user roles:", roleError);
      } else if (userRoles && userRoles.length > 0 && userRoles[0].roles) {
        roleName = userRoles[0].roles.name;
      } else {
        // Insert the viewer role if no role found
        try {
          // First get the viewer role ID
          const { data: viewerRole } = await supabase
            .from("roles")
            .select("id")
            .eq("name", "viewer")
            .single();

          if (viewerRole) {
            // Then insert the role assignment
            await supabase.from("user_roles").insert({
              user_id: userId,
              role_id: viewerRole.id,
            });
            console.log("Added viewer role to user");
          }
        } catch (insertError) {
          console.error("Error assigning default role:", insertError);
        }
      }

      return {
        ...profile,
        role: roleName,
      };
    } catch (err) {
      console.error("Error getting user details:", err);
      return null;
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.session?.user) {
        const userDetails = await getUserDetails(sessionData.session.user.id);

        if (userDetails) {
          setUser({
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            ...userDetails,
          });
        } else {
          setUser({
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
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

  useEffect(() => {
    // Initial user fetch
    refreshUser();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

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
            });
          }
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [refreshUser]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
