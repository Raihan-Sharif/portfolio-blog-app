"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';

interface OnlineUser {
  id: number;
  user_id: string | null;
  session_id: string;
  display_name: string;
  last_activity: string;
  is_authenticated: boolean;
  page_url: string;
  ip_address?: string;
}

interface OnlineUserStats {
  total_online: number;
  authenticated_users: number;
  anonymous_users: number;
  recent_users: OnlineUser[];
}

// Generate a unique session ID for the browser
function generateSessionId(): string {
  const stored = localStorage.getItem('portfolio_session_id');
  if (stored) return stored;
  
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('portfolio_session_id', sessionId);
  return sessionId;
}

// Generate a simple browser fingerprint
function getBrowserFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join('|');
  
  return btoa(fingerprint).substr(0, 32);
}

export function useEnhancedOnlineTracking() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [onlineStats, setOnlineStats] = useState<OnlineUserStats>({
    total_online: 0,
    authenticated_users: 0,
    anonymous_users: 0,
    recent_users: []
  });
  
  const lastUpdateRef = useRef<number>(0);
  const sessionIdRef = useRef<string>('');
  const fingerprintRef = useRef<string>('');
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Throttle function to prevent spam
  const shouldUpdate = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // For authenticated users: update every 2 minutes
    // For anonymous users: update every 60 seconds
    const updateInterval = user ? 120000 : 60000; // 2 min vs 1 min
    
    if (timeSinceLastUpdate < updateInterval) {
      return false;
    }
    
    lastUpdateRef.current = now;
    return true;
  }, [user]);

  // Cache IP address to avoid continuous fetching
  const ipCacheRef = useRef<string | null>(null);
  const ipCacheTimeRef = useRef<number>(0);
  const IP_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get user's IP address with caching
  const getUserIP = useCallback(async (): Promise<string | null> => {
    // Return cached IP if still valid
    const now = Date.now();
    if (ipCacheRef.current && (now - ipCacheTimeRef.current) < IP_CACHE_DURATION) {
      return ipCacheRef.current;
    }

    try {
      const response = await fetch('/api/get-client-ip');
      if (response.ok) {
        const data = await response.json();
        ipCacheRef.current = data.ip;
        ipCacheTimeRef.current = now;
        return data.ip;
      }
    } catch (error) {
      console.warn('Could not get client IP:', error);
    }
    return ipCacheRef.current; // Return cached value even if fetch failed
  }, []);

  // Update online presence
  const updateOnlinePresence = useCallback(async (force: boolean = false) => {
    if (!force && !shouldUpdate()) {
      return;
    }

    try {
      const sessionId = sessionIdRef.current || generateSessionId();
      sessionIdRef.current = sessionId;
      
      if (!fingerprintRef.current) {
        fingerprintRef.current = getBrowserFingerprint();
      }

      const ip = await getUserIP();
      
      // Call the enhanced upsert function
      const { error } = await supabase.rpc('upsert_online_user', {
        p_user_id: user?.id || null,
        p_session_id: sessionId,
        p_ip_address: ip,
        p_browser_fingerprint: fingerprintRef.current,
        p_page_url: pathname,
        p_user_agent: navigator.userAgent,
        p_display_name: user ? (user.user_metadata?.full_name || user.email || 'User') : 'Anonymous'
      });

      if (error) {
        console.error('Error updating online presence:', error);
      }
    } catch (error) {
      console.error('Error in updateOnlinePresence:', error);
    }
  }, [user, pathname, shouldUpdate, getUserIP]);

  // Fetch online user statistics
  const fetchOnlineStats = useCallback(async () => {
    try {
      // Get basic stats
      const { data: stats, error: statsError } = await supabase.rpc('get_online_user_stats');
      
      if (statsError) {
        console.error('Error fetching online stats:', statsError);
        return;
      }

      // Get recent users (for admin dashboard)
      let recentUsers: OnlineUser[] = [];
      if (user) {
        const { data: recent, error: recentError } = await supabase.rpc('get_recent_online_users', {
          limit_count: 10
        });
        
        if (!recentError && recent) {
          recentUsers = recent;
        }
      }

      if (stats && stats.length > 0) {
        setOnlineStats({
          total_online: stats[0].total_online || 0,
          authenticated_users: stats[0].authenticated_users || 0,
          anonymous_users: stats[0].anonymous_users || 0,
          recent_users: recentUsers
        });
      }
    } catch (error) {
      console.error('Error fetching online stats:', error);
    }
  }, [user]);

  // Remove user session on logout
  const removeSession = useCallback(async () => {
    try {
      if (user) {
        await supabase.rpc('remove_user_session', {
          p_user_id: user.id,
          p_session_id: null
        });
      } else {
        await supabase.rpc('remove_user_session', {
          p_user_id: null,
          p_session_id: sessionIdRef.current
        });
      }
    } catch (error) {
      console.error('Error removing session:', error);
    }
  }, [user]);

  // Set up heartbeat for active users
  useEffect(() => {
    // Initial update
    updateOnlinePresence(true);
    fetchOnlineStats();

    // Set up heartbeat interval
    const heartbeatInterval = setInterval(() => {
      updateOnlinePresence();
      fetchOnlineStats();
    }, 30000); // Check every 30 seconds

    heartbeatIntervalRef.current = heartbeatInterval;

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [updateOnlinePresence, fetchOnlineStats]);

  // Update on route changes (but throttled)
  useEffect(() => {
    updateOnlinePresence();
  }, [pathname, updateOnlinePresence]);

  // Clean up on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      removeSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User switched tabs/minimized - don't remove session immediately
        // The server will clean up stale sessions automatically
      } else if (document.visibilityState === 'visible') {
        // User returned - update presence
        updateOnlinePresence(true);
        fetchOnlineStats();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      removeSession();
    };
  }, [removeSession, updateOnlinePresence, fetchOnlineStats]);

  return {
    onlineStats,
    updateOnlinePresence: () => updateOnlinePresence(true),
    removeSession,
    refreshStats: fetchOnlineStats
  };
}

// Hook for getting just the stats (lighter version)
export function useOnlineUserStats() {
  const [stats, setStats] = useState({
    total_online: 0,
    authenticated_users: 0,
    anonymous_users: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_online_user_stats');
      
      if (!error && data && data.length > 0) {
        setStats({
          total_online: data[0].total_online || 0,
          authenticated_users: data[0].authenticated_users || 0,
          anonymous_users: data[0].anonymous_users || 0
        });
      }
    } catch (error) {
      console.error('Error fetching online user stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, refreshStats: fetchStats };
}