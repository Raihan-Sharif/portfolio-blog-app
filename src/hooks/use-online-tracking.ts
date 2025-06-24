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

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate or use provided session ID - only on client side
  const getSessionId = useCallback(() => {
    if (!isClient) return null;

    if (sessionId) return sessionId;

    // Try to get from sessionStorage first
    let storedSessionId = null;
    try {
      storedSessionId = sessionStorage.getItem("user_session_id");
      if (!storedSessionId) {
        storedSessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        sessionStorage.setItem("user_session_id", storedSessionId);
      }
    } catch (error) {
      // Fallback if sessionStorage is not available
      storedSessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    return storedSessionId;
  }, [sessionId, isClient]);

  // Get user's IP address and user agent
  const getUserInfo = useCallback(async () => {
    if (!isClient) return { userAgent: null, pageUrl: null, ipAddress: null };

    const userAgent = navigator.userAgent;
    const pageUrl = window.location.pathname;

    // Get IP address (optional)
    let ipAddress = null;
    try {
      // Optional: You can use a service like ipify.org
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

  // Update online status
  const updateOnlineStatus = useCallback(async () => {
    if (!enabled || !user || !isClient) return;

    const now = Date.now();
    // Prevent too frequent updates
    if (now - lastUpdateRef.current < updateInterval / 2) {
      return;
    }

    try {
      const userInfo = await getUserInfo();
      const currentSessionId = getSessionId();

      if (!currentSessionId) return;

      await supabase.rpc("update_online_user", {
        p_user_id: user?.id || null,
        p_session_id: currentSessionId,
        p_ip_address: userInfo.ipAddress,
        p_user_agent: userInfo.userAgent,
        p_page_url: userInfo.pageUrl,
        p_is_authenticated: !!user?.id,
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
    const throttledActivity = throttle(handleActivity, updateInterval / 6); // Throttle activity updates

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

  // Handle page unload
  useEffect(() => {
    if (!enabled || !isClient) return;

    const handleBeforeUnload = () => {
      const currentSessionId = getSessionId();
      if (!currentSessionId) return;

      // Note: We can't make async calls here, but we could use sendBeacon
      // if we had an endpoint that accepts beacon data
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/user-offline",
          JSON.stringify({
            sessionId: currentSessionId,
            userId: user?.id,
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, user, getSessionId, isClient]);

  return {
    updateOnlineStatus,
    sessionId: isClient ? getSessionId() : null,
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
