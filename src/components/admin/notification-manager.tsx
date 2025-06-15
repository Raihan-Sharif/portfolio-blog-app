// src/components/admin/notification-manager.tsx
"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";
import { useCallback, useEffect, useRef } from "react";

interface NotificationManagerProps {
  onNotificationReceived?: (notification: any) => void;
}

export function NotificationManager({
  onNotificationReceived,
}: NotificationManagerProps) {
  const { user, isAdmin } = useAuth();
  const subscriptionRef = useRef<any>(null);

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
    [isAdmin, onNotificationReceived]
  );

  // Listen for real-time notifications
  useEffect(() => {
    if (!user || !isAdmin) return;

    // Subscribe to new notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `is_global=eq.true`,
        },
        (payload) => {
          console.log("New notification received:", payload);
          if (onNotificationReceived) {
            onNotificationReceived(payload.new);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contact_messages",
        },
        (payload) => {
          // Auto-create notification for new contact messages
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
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [user, isAdmin, onNotificationReceived, createNotification]);

  // Listen for system events and create notifications
  useEffect(() => {
    if (!isAdmin) return;

    // Listen for new user registrations
    const userChannel = supabase
      .channel("user_registrations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          const newUser = payload.new;
          createNotification(
            "New User Registration",
            `${newUser.full_name || "A new user"} has registered`,
            "system",
            "normal",
            { user_id: newUser.id },
            "/admin/users",
            "View Users"
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [isAdmin, createNotification]);

  // Auto-cleanup old notifications
  useEffect(() => {
    if (!isAdmin) return;

    const cleanupInterval = setInterval(async () => {
      try {
        // Delete notifications older than 30 days
        await supabase
          .from("notifications")
          .delete()
          .lt(
            "created_at",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          );
      } catch (error) {
        console.error("Error cleaning up notifications:", error);
      }
    }, 24 * 60 * 60 * 1000); // Once per day

    return () => clearInterval(cleanupInterval);
  }, [isAdmin]);

  // This component doesn't render anything
  return null;
}

// Hook for using notifications
export function useNotifications() {
  const { user, isAdmin } = useAuth();

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
      options?: {
        priority?: "low" | "normal" | "high" | "urgent";
        metadata?: any;
        actionUrl?: string;
        actionLabel?: string;
        userId?: string;
        isGlobal?: boolean;
      }
    ) => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("notifications")
          .insert({
            title,
            message,
            type,
            priority: options?.priority || "normal",
            user_id: options?.userId || (options?.isGlobal ? null : user.id),
            is_global: options?.isGlobal || false,
            metadata: options?.metadata,
            action_url: options?.actionUrl,
            action_label: options?.actionLabel,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
      }
    },
    [user]
  );

  const markAsRead = useCallback(
    async (notificationId: number) => {
      if (!user) return;

      try {
        await supabase.rpc("mark_notification_read", {
          p_notification_id: notificationId,
          p_user_id: user.id,
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
      }
    },
    [user]
  );

  const getNotifications = useCallback(
    async (limit = 10) => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .or(`user_id.eq.${user.id},is_global.eq.true`)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }
    },
    [user]
  );

  const getUnreadCount = useCallback(async () => {
    if (!user) return 0;

    try {
      // For global notifications, check if user has read them via notification_recipients
      // For user-specific notifications, check is_read directly
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          id,
          is_global,
          is_read,
          notification_recipients!left(is_read)
        `
        )
        .or(`user_id.eq.${user.id},is_global.eq.true`)
        .or(
          "is_read.eq.false,notification_recipients.is_read.eq.false,notification_recipients.is_read.is.null"
        );

      if (error) throw error;

      // Count unread notifications
      const unreadCount =
        data?.filter((notification) => {
          if (notification.is_global) {
            // For global notifications, check if user has read it
            return !notification.notification_recipients?.some(
              (recipient: any) => recipient.is_read === true
            );
          } else {
            // For user-specific notifications, check is_read directly
            return !notification.is_read;
          }
        }).length || 0;

      return unreadCount;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }, [user]);

  return {
    createNotification,
    markAsRead,
    getNotifications,
    getUnreadCount,
    isAdmin,
  };
}
