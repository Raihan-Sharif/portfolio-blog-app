"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useEffect, useState } from "react";

/**
 * Simplified hook for tracking authentication status and session health
 */
export function useAuthStatus() {
  const { user, session, loading } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [sessionHealth, setSessionHealth] = useState<
    "healthy" | "warning" | "expired"
  >("healthy");

  // Track online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Initial check
    updateOnlineStatus();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Monitor session health
  useEffect(() => {
    if (!session || !session.expires_at) {
      setSessionHealth("expired");
      return;
    }

    const checkSessionHealth = () => {
      const expiresAt = new Date(session.expires_at! * 1000).getTime();
      const now = Date.now();
      const timeToExpiry = expiresAt - now;

      if (timeToExpiry < 0) {
        setSessionHealth("expired");
      } else if (timeToExpiry < 10 * 60 * 1000) {
        // Less than 10 minutes
        setSessionHealth("warning");
      } else {
        setSessionHealth("healthy");
      }
    };

    // Check immediately
    checkSessionHealth();

    // Check every minute
    const interval = setInterval(checkSessionHealth, 60 * 1000);

    return () => clearInterval(interval);
  }, [session]);

  const timeUntilExpiry =
    session && session.expires_at
      ? new Date(session.expires_at * 1000).getTime() - Date.now()
      : 0;

  return {
    isAuthenticated: !!user && !!session,
    user,
    session,
    loading,
    sessionHealth,
    isOnline,
    lastActivity: Date.now(), // Simplified
    timeUntilExpiry,
  };
}
