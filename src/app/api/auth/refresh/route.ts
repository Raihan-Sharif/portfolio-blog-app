// src/app/api/auth/refresh/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Get the refresh token from the request
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Refresh the session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      console.error("Session refresh error:", error);
      return NextResponse.json(
        { error: "Failed to refresh session" },
        { status: 401 }
      );
    }

    // Return the new session data
    return NextResponse.json({
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.error("Session refresh API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// src/app/api/auth/validate/route.ts
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Get current session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        { error: "Session validation failed" },
        { status: 401 }
      );
    }

    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    // Check if session is close to expiry
    const expiresAt = new Date(session.expires_at! * 1000).getTime();
    const now = Date.now();
    const timeToExpiry = expiresAt - now;
    const needsRefresh = timeToExpiry < 5 * 60 * 1000; // Less than 5 minutes

    return NextResponse.json({
      valid: true,
      session,
      needsRefresh,
      timeToExpiry,
    });
  } catch (error) {
    console.error("Session validation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// src/hooks/use-online-tracking.ts
("use client");

import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseOnlineTrackingOptions {
  enabled?: boolean;
  updateInterval?: number; // in milliseconds
  sessionId?: string;
}

/**
 * Enhanced online tracking hook with better session management
 */
export function useOnlineTracking(
  user: (User & { full_name?: string; role?: string }) | null,
  options: UseOnlineTrackingOptions = {}
) {
  const { enabled = true, updateInterval = 30000 } = options;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>("");
  const lastUpdateRef = useRef<number>(0);
  const isUpdatingRef = useRef(false);

  // Generate session ID on mount
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }
  }, []);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Update online status function
  const updateOnlineStatus = useCallback(async () => {
    if (!enabled || !user || !isOnline || isUpdatingRef.current) return;

    // Throttle updates
    const now = Date.now();
    if (now - lastUpdateRef.current < 10000) {
      // Min 10 seconds between updates
      return;
    }

    try {
      isUpdatingRef.current = true;
      lastUpdateRef.current = now;

      const { error } = await supabase.rpc("update_online_user", {
        p_user_id: user.id,
        p_session_id: sessionIdRef.current,
        p_ip_address: null, // Will be handled server-side
        p_user_agent: navigator.userAgent,
        p_page_url: window.location.pathname,
        p_is_authenticated: true,
      });

      if (error) {
        console.error("Error updating online status:", error);
      }
    } catch (error) {
      console.error("Error in updateOnlineStatus:", error);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [enabled, user, isOnline]);

  // Remove online status function
  const removeOnlineStatus = useCallback(async () => {
    if (!sessionIdRef.current) return;

    try {
      // Use beacon API for reliable cleanup during unload
      const data = JSON.stringify({
        sessionId: sessionIdRef.current,
        userId: user?.id || null,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/user-offline", data);
      } else {
        // Fallback for browsers without beacon support
        fetch("/api/user-offline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: data,
          keepalive: true,
        }).catch(console.error);
      }
    } catch (error) {
      console.error("Error removing online status:", error);
    }
  }, [user?.id]);

  // Set up periodic updates
  useEffect(() => {
    if (!enabled || !user || !isOnline) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial update
    updateOnlineStatus();

    // Set up interval
    intervalRef.current = setInterval(updateOnlineStatus, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, user, isOnline, updateInterval, updateOnlineStatus]);

  // Activity tracking
  useEffect(() => {
    if (!enabled || !user || !isOnline) return;

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];

    const handleActivity = () => {
      updateOnlineStatus();
    };

    // Throttled activity handler
    let activityTimeout: NodeJS.Timeout;
    const throttledHandler = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(handleActivity, 5000); // Update after 5 seconds of activity
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, throttledHandler, { passive: true });
    });

    return () => {
      clearTimeout(activityTimeout);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, throttledHandler);
      });
    };
  }, [enabled, user, isOnline, updateOnlineStatus]);

  // Page visibility handling
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, reduce update frequency or pause
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Page is visible again, resume updates
        if (user && isOnline && !intervalRef.current) {
          updateOnlineStatus();
          intervalRef.current = setInterval(updateOnlineStatus, updateInterval);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, user, isOnline, updateInterval, updateOnlineStatus]);

  // Cleanup on unmount or user change
  useEffect(() => {
    return () => {
      removeOnlineStatus();
    };
  }, [removeOnlineStatus]);

  // Cleanup on page unload
  useEffect(() => {
    const handleUnload = () => {
      removeOnlineStatus();
    };

    const handleBeforeUnload = () => {
      removeOnlineStatus();
    };

    window.addEventListener("unload", handleUnload);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("unload", handleUnload);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [removeOnlineStatus]);

  return {
    isOnline,
    sessionId: sessionIdRef.current,
    updateOnlineStatus,
    removeOnlineStatus,
  };
}
