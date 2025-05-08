"use client";

import { supabase } from "@/lib/supabase/client";
import {
  createContext,
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
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

      return {
        id: userId,
        ...profile,
        role: userRole?.roles?.name || "viewer",
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

        setUser({
          id: sessionData.session.user.id,
          email: sessionData.session.user.email,
          ...userDetails,
        });
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

          setUser({
            id: session.user.id,
            email: session.user.email,
            ...userDetails,
          });
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
