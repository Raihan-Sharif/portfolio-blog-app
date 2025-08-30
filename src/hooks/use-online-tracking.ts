// src/hooks/use-online-tracking.ts
"use client";

import { supabase } from "@/lib/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseOnlineTrackingOptions {
  enabled?: boolean;
  updateInterval?: number; // in milliseconds
  sessionId?: string;
}

export function useOnlineTracking(
  user: any,
  options: UseOnlineTrackingOptions = {}
) {
  const {
    enabled = true,
    updateInterval = 30000, // 30 seconds
    sessionId,
  } = options;

  const [isClient, setIsClient] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const isActiveRef = useRef(true);
  const currentSessionId = useRef<string | null>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate or use provided session ID - only on client side
  const getSessionId = useCallback(() => {
    if (!isClient) return null;

    if (sessionId) return sessionId;

    // Generate a unique session ID that persists during the browser session
    if (!currentSessionId.current) {
      try {
        let storedSessionId = sessionStorage.getItem("user_session_id");
        if (!storedSessionId) {
          const timestamp = Date.now();
          const randomSuffix = Math.floor(timestamp % 100000).toString(36);
          storedSessionId = `session_${timestamp}_${randomSuffix}`;
          sessionStorage.setItem("user_session_id", storedSessionId);
        }
        currentSessionId.current = storedSessionId;
      } catch (error) {
        // Fallback if sessionStorage is not available
        const timestamp = Date.now();
        const randomSuffix = Math.floor(timestamp % 100000).toString(36);
        currentSessionId.current = `session_${timestamp}_${randomSuffix}`;
      }
    }

    return currentSessionId.current;
  }, [sessionId, isClient]);

  // Get user's IP address and user agent
  const getUserInfo = useCallback(async () => {
    if (!isClient) return { userAgent: null, pageUrl: null, ipAddress: null };

    const userAgent = navigator.userAgent;
    const pageUrl = window.location.pathname;

    // Get IP address (optional)
    let ipAddress = null;
    try {
      // You can use a service like ipify.org if needed
      // const response = await fetch('https://api.ipify.org?format=json');
      // const data = await response.json();
      // ipAddress = data.ip;
    } catch (error) {
      console.warn("Could not fetch IP address:", error);
    }

    return {
      userAgent,
      pageUrl,
      ipAddress,
    };
  }, [isClient]);

  // Update online status with better authentication tracking
  const updateOnlineStatus = useCallback(async () => {
    if (!enabled || !isClient) return;

    const now = Date.now();
    // Prevent too frequent updates
    if (now - lastUpdateRef.current < updateInterval / 2) {
      return;
    }

    try {
      const userInfo = await getUserInfo();
      const currentSessionIdValue = getSessionId();

      if (!currentSessionIdValue) return;

      // Determine if user is authenticated more reliably
      const isAuthenticated = !!(user && user.id);

      await supabase.rpc("update_online_user", {
        p_user_id: isAuthenticated ? user.id : null,
        p_session_id: currentSessionIdValue,
        p_ip_address: userInfo.ipAddress,
        p_user_agent: userInfo.userAgent,
        p_page_url: userInfo.pageUrl,
        p_is_authenticated: isAuthenticated,
      });

      lastUpdateRef.current = now;
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  }, [enabled, user, updateInterval, getUserInfo, getSessionId, isClient]);

  // Track page visibility
  const handleVisibilityChange = useCallback(() => {
    if (!isClient) return;

    isActiveRef.current = !document.hidden;

    if (isActiveRef.current) {
      // User came back to the page, update immediately
      updateOnlineStatus();
    }
  }, [updateOnlineStatus, isClient]);

  // Track user activity
  const handleActivity = useCallback(() => {
    if (!isClient) return;

    if (isActiveRef.current) {
      const now = Date.now();
      // Update if enough time has passed since last update
      if (now - lastUpdateRef.current > updateInterval / 3) {
        updateOnlineStatus();
      }
    }
  }, [updateOnlineStatus, updateInterval, isClient]);

  // Clean up user session when they leave
  const cleanupUserSession = useCallback(async () => {
    const currentSessionIdValue = getSessionId();
    if (!currentSessionIdValue) return;

    try {
      // Remove from online users table
      await supabase
        .from("online_users")
        .delete()
        .eq("session_id", currentSessionIdValue);
    } catch (error) {
      console.error("Error cleaning up user session:", error);
    }
  }, [getSessionId]);

  // Set up tracking
  useEffect(() => {
    if (!enabled || !isClient) return;

    // Initial update
    updateOnlineStatus();

    // Set up periodic updates
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        updateOnlineStatus();
      }
    }, updateInterval);

    // Listen for page visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const throttledActivity = throttle(handleActivity, updateInterval / 6);

    activityEvents.forEach((event) => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      activityEvents.forEach((event) => {
        document.removeEventListener(event, throttledActivity);
      });
    };
  }, [
    enabled,
    isClient,
    updateInterval,
    updateOnlineStatus,
    handleVisibilityChange,
    handleActivity,
  ]);

  // Handle page unload with better cleanup
  useEffect(() => {
    if (!enabled || !isClient) return;

    const handleBeforeUnload = async () => {
      const currentSessionIdValue = getSessionId();
      if (!currentSessionIdValue) return;

      // Use sendBeacon for reliable cleanup on page unload
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          sessionId: currentSessionIdValue,
          userId: user?.id,
        });

        navigator.sendBeacon("/api/user-offline", data);
      } else {
        // Fallback for browsers that don't support sendBeacon
        try {
          await cleanupUserSession();
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };

    const handlePageHide = () => {
      // More reliable than beforeunload
      handleBeforeUnload();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [enabled, user, getSessionId, cleanupUserSession, isClient]);

  // Clean up when user changes (login/logout)
  useEffect(() => {
    if (!isClient) return;

    // When user changes, update the session immediately
    if (enabled) {
      updateOnlineStatus();
    }
  }, [user?.id, enabled, updateOnlineStatus, isClient]);

  return {
    updateOnlineStatus,
    sessionId: isClient ? getSessionId() : null,
    cleanupUserSession,
  };
}

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}
