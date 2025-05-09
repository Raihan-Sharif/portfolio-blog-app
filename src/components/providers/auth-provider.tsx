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

interface RoleData {
  name: string;
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

      // Get user role
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", userId)
        .single();

      if (roleError) {
        console.error("Error fetching user role:", roleError);
      }

      // Safely extract the role name with type checking
      let roleName = "viewer"; // Default role

      if (userRole && userRole.roles) {
        // Handle if roles is an object with name property
        if (
          typeof userRole.roles === "object" &&
          userRole.roles !== null &&
          "name" in userRole.roles
        ) {
          roleName = (userRole.roles as RoleData).name;
        }
        // Handle if roles is an array with objects that have name property
        else if (
          Array.isArray(userRole.roles) &&
          userRole.roles.length > 0 &&
          typeof userRole.roles[0] === "object" &&
          userRole.roles[0] !== null &&
          "name" in userRole.roles[0]
        ) {
          roleName = (userRole.roles[0] as RoleData).name;
        }
      }

      return {
        id: userId,
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
