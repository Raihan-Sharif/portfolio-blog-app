// src/components/admin/notification-manager.tsx
"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/utils/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";

interface NotificationManagerProps {
  onNotificationReceived?: (notification: any) => void;
}

export function NotificationManager({
  onNotificationReceived,
}: NotificationManagerProps) {
  const { user, isAdmin } = useAuth();
  const subscriptionRef = useRef<any>(null);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const supabase = createClient();

  // Create notifications for various events
  const createNotification = useCallback(
    async (
      title: string,
      message: string,
      type:
        | "info"
        | "success"
        | "warning"
        | "error"
        | "contact"
        | "comment"
        | "system",
      priority: "low" | "normal" | "high" | "urgent" = "normal",
      metadata?: any,
      actionUrl?: string,
      actionLabel?: string
    ) => {
      if (!isAdmin) return;

      try {
        const { data, error } = await supabase
          .from("notifications")
          .insert({
            title,
            message,
            type,
            priority,
            is_global: true,
            metadata,
            action_url: actionUrl,
            action_label: actionLabel,
          })
          .select()
          .single();

        if (error) throw error;

        if (onNotificationReceived && data) {
          onNotificationReceived(data);
        }

        return data;
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    },
    [isAdmin, onNotificationReceived, supabase]
  );

  // Listen for real-time notifications with error handling
  useEffect(() => {
    if (!user || !isAdmin || !realtimeEnabled) return;

    let mounted = true;
    let channel: any = null;

    const setupRealtimeConnection = async () => {
      try {
        // Create channel with error handling
        channel = supabase.channel(`notifications_${Date.now()}`, {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        // Add error event handlers
        channel.on("system", {}, (payload: any) => {
          console.log("Realtime system event:", payload);
          if (payload.status === "CLOSED" || payload.status === "ERROR") {
            console.warn("Realtime connection issue, disabling realtime");
            setRealtimeEnabled(false);
          }
        });

        // Subscribe to notifications
        channel.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `is_global=eq.true`,
          },
          (payload: any) => {
            console.log("New notification received:", payload);
            if (mounted && onNotificationReceived) {
              onNotificationReceived(payload.new);
            }
          }
        );

        // Subscribe to contact messages
        channel.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public", 
            table: "contact_messages",
          },
          (payload: any) => {
            if (!mounted) return;
            
            const message = payload.new;
            createNotification(
              "New Contact Message",
              `New message from ${message.name}: ${message.subject}`,
              "contact",
              message.priority === "urgent" ? "urgent" : "normal",
              { contact_message_id: message.id, sender_name: message.name },
              "/admin/contact",
              "View Message"
            );
          }
        );

        // Subscribe with timeout
        const subscribePromise = channel.subscribe();
        
        // Set a timeout for the subscription
        const timeoutId = setTimeout(() => {
          console.warn("Realtime subscription timeout, disabling realtime");
          setRealtimeEnabled(false);
          setConnectionAttempts(prev => prev + 1);
        }, 10000); // 10 second timeout

        // Wait for subscription
        const status = await subscribePromise;
        clearTimeout(timeoutId);

        if (status === "SUBSCRIBED" && mounted) {
          console.log("Realtime connected successfully");
          subscriptionRef.current = channel;
          setConnectionAttempts(0);
        } else {
          console.warn("Failed to subscribe to realtime, disabling");
          setRealtimeEnabled(false);
          setConnectionAttempts(prev => prev + 1);
        }

      } catch (error) {
        console.error("Realtime connection error:", error);
        setRealtimeEnabled(false);
        setConnectionAttempts(prev => prev + 1);
        
        // If we've failed multiple times, don't retry
        if (connectionAttempts >= 3) {
          console.log("Multiple realtime failures, staying in polling mode");
        }
      }
    };

    // Only attempt connection if we haven't failed too many times
    if (connectionAttempts < 3) {
      setupRealtimeConnection();
    }

    return () => {
      mounted = false;
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error("Error removing channel:", error);
        }
      }
    };
  }, [user, isAdmin, realtimeEnabled, connectionAttempts, onNotificationReceived, createNotification, supabase]);

  // Fallback: Poll for notifications when realtime is disabled
  useEffect(() => {
    if (!user || !isAdmin || realtimeEnabled) return;

    console.log("Using polling mode for notifications");
    
    // Poll every 30 seconds for new notifications
    const pollInterval = setInterval(async () => {
      try {
        const { data: notifications, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("is_global", true)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) throw error;

        // Check if this is a new notification (simple check)
        if (notifications && notifications.length > 0 && onNotificationReceived) {
          const latest = notifications[0];
          const createdAt = new Date(latest.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - createdAt.getTime();
          
          // If the notification is less than 35 seconds old, consider it new
          if (timeDiff < 35000) {
            onNotificationReceived(latest);
          }
        }
      } catch (error) {
        console.error("Error polling notifications:", error);
      }
    }, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [user, isAdmin, realtimeEnabled, onNotificationReceived, supabase]);

  // Listen for user registrations (only if realtime is working)
  useEffect(() => {
    if (!isAdmin || !realtimeEnabled) return;

    let mounted = true;
    let userChannel: any = null;

    const setupUserChannel = async () => {
      try {
        userChannel = supabase.channel(`user_registrations_${Date.now()}`);

        userChannel.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "profiles",
          },
          (payload: any) => {
            if (!mounted) return;
            
            const newUser = payload.new;
            createNotification(
              "New User Registration",
              `${newUser.full_name || "New user"} has joined the platform`,
              "system",
              "normal",
              { user_id: newUser.id, user_name: newUser.full_name },
              "/admin/users",
              "View Users"
            );
          }
        );

        await userChannel.subscribe();
        
      } catch (error) {
        console.error("Error setting up user registration channel:", error);
      }
    };

    setupUserChannel();

    return () => {
      mounted = false;
      if (userChannel) {
        try {
          supabase.removeChannel(userChannel);
        } catch (error) {
          console.error("Error removing user channel:", error);
        }
      }
    };
  }, [isAdmin, realtimeEnabled, createNotification, supabase]);

  // Don't render anything - this is a background service
  return null;
}