// src/components/admin/admin-layout.tsx
"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { OnlineUsersNavbar } from "@/components/admin/online-users-navbar";
import { useEnhancedOnlineTracking } from "@/hooks/use-enhanced-online-tracking";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  Home,
  Info,
  LogOut,
  Mail,
  MailOpen,
  Menu,
  MessageSquare,
  Phone,
  Send,
  Settings,
  Shield,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "contact"
    | "comment"
    | "system";
  priority: "low" | "normal" | "high" | "urgent";
  icon?: string;
  action_url?: string;
  action_label?: string;
  is_read: boolean;
  is_global: boolean;
  metadata?: any;
  created_at: string;
}


export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  
  // Enhanced online tracking
  const { onlineStats } = useEnhancedOnlineTracking();

  // Enhanced admin check with better caching
  const hasInitialized = useRef(false);
  const adminCache = useRef<
    Map<string, { status: boolean; timestamp: number }>
  >(new Map());
  const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  const checkAdminStatus = useCallback(async (userId: string) => {
    const cached = adminCache.current.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.status;
    }

    try {
      const { data, error } = await supabase.rpc("get_user_with_role", {
        p_user_id: userId,
      });

      const adminStatus =
        !error && data && data.length > 0 && data[0].role_name === "admin";

      adminCache.current.set(userId, {
        status: adminStatus,
        timestamp: Date.now(),
      });

      return adminStatus;
    } catch (err) {
      console.error("Error checking admin status:", err);
      return false;
    }
  }, []);


  // Fetch notifications with proper error handling and read status
  const fetchNotifications = useCallback(async () => {
    if (!user || !isAdmin) return;

    try {
      // Fetch notifications with recipient data for global notifications
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          *,
          notification_recipients!left(
            is_read,
            user_id
          )
        `
        )
        .or(`user_id.eq.${user.id},is_global.eq.true`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Process notifications to determine read status
      const processedNotifications = (data || []).map((notification) => {
        let isRead = false;

        if (notification.is_global) {
          // For global notifications, check if current user has read it
          const userRecipient = notification.notification_recipients?.find(
            (recipient: any) => recipient.user_id === user.id
          );
          isRead = userRecipient?.is_read || false;
        } else {
          // For user-specific notifications
          isRead = notification.is_read;
        }

        return {
          ...notification,
          is_read: isRead,
        };
      });

      setNotifications(processedNotifications);
      setUnreadCount(processedNotifications.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user, isAdmin]);


  // Mark notification as read with proper implementation
  const markNotificationAsRead = useCallback(
    async (notificationId: number) => {
      if (!user) return;

      try {
        const { error } = await supabase.rpc("mark_notification_read", {
          p_notification_id: notificationId,
          p_user_id: user.id,
        });

        if (error) throw error;

        // Update local state immediately
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [user]
  );

  // FIXED: Initialize admin status only once, not on every navigation
  useEffect(() => {
    if (loading || hasInitialized.current) return;

    if (!user) {
      if (!loading) {
        router.push("/sign-in?redirect=" + encodeURIComponent(pathname));
      }
      return;
    }

    const initializeAdmin = async () => {
      // FIXED: Don't show loading during admin check to prevent double loading
      // The middleware already validates admin access, so this is just a UI state update
      
      try {
        const adminStatus = await checkAdminStatus(user.id);
        setIsAdmin(adminStatus);
        hasInitialized.current = true;

        if (!adminStatus && !loading) {
          router.push("/");
        }
      } catch (err) {
        console.error("Error initializing admin:", err);
        if (!loading) {
          router.push("/");
        }
      }
    };

    initializeAdmin();
  }, [user, loading, router, checkAdminStatus]); // REMOVED: pathname dependency to prevent re-runs on navigation

  // Fetch notifications for admin users
  useEffect(() => {
    if (isAdmin && user) {
      fetchNotifications();

      // Set up interval for notifications updates
      const notificationsInterval = setInterval(fetchNotifications, 120000); // 2 minutes

      return () => {
        clearInterval(notificationsInterval);
      };
    }
  }, [isAdmin, user, fetchNotifications]);

  const handleSignOut = useCallback(async () => {
    if (user?.id) {
      adminCache.current.delete(user.id);
    }
    await signOut();
    router.push("/");
  }, [user, signOut, router]);

  const getNotificationIcon = (type: string, icon?: string) => {
    if (icon) {
      const IconComponent = {
        Mail: Mail,
        MessageSquare: MessageSquare,
        Bell: Bell,
        AlertCircle: AlertCircle,
        CheckCircle: CheckCircle,
        Info: AlertCircle,
        Activity: Activity,
      }[icon];

      if (IconComponent) {
        return <IconComponent size={16} />;
      }
    }

    switch (type) {
      case "contact":
        return <Mail size={16} />;
      case "comment":
        return <MessageSquare size={16} />;
      case "success":
        return <CheckCircle size={16} />;
      case "warning":
        return <AlertCircle size={16} />;
      case "error":
        return <AlertCircle size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === "urgent") return "text-red-500";
    if (priority === "high") return "text-orange-500";

    switch (type) {
      case "contact":
        return "text-blue-500";
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  // Handle notification click
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.is_read) {
        markNotificationAsRead(notification.id);
      }
      if (notification.action_url) {
        router.push(notification.action_url);
      }
      setNotificationsPanelOpen(false);
    },
    [markNotificationAsRead, router]
  );

  // Navigation items with enhanced organization
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <BarChart3 size={20} />,
      category: "main",
    },
    {
      name: "Services",
      href: "/admin/services",
      icon: <Settings size={20} />,
      category: "content",
    },
    {
      name: "Blog Posts",
      href: "/admin/blog",
      icon: <FileText size={20} />,
      category: "content",
    },
    {
      name: "Projects",
      href: "/admin/projects",
      icon: <Briefcase size={20} />,
      category: "content",
    },
    {
      name: "Hero Section",
      href: "/admin/hero",
      icon: <Star size={20} />,
      category: "pages",
    },
    {
      name: "About Page",
      href: "/admin/about",
      icon: <Info size={20} />,
      category: "pages",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <Users size={20} />,
      category: "management",
    },
    {
      name: "Contact Info",
      href: "/admin/contact-management",
      icon: <Phone size={20} />,
      category: "management",
    },
    {
      name: "Messages",
      href: "/admin/contact",
      icon: <Mail size={20} />,
      category: "management",
    },
    {
      name: "Newsletter",
      href: "/admin/newsletter",
      icon: <MailOpen size={20} />,
      category: "management",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings size={20} />,
      category: "system",
    },
  ];

  const groupedNavItems = navItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const categoryLabels = {
    main: "Overview",
    content: "Content",
    pages: "Pages",
    management: "Management",
    system: "System",
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // FIXED: Only show loading on initial auth load, not on admin verification
  // This prevents double loading states with dashboard skeleton
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !hasInitialized.current || !isAdmin) {
    return null;
  }

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/50 min-h-screen flex">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={handleOverlayClick}
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 shadow-2xl transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64",
          isSidebarOpen || "lg:translate-x-0 -translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-r from-primary/5 to-purple-500/5">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="h-8 w-8 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-lg hidden lg:flex"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>

            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="h-8 w-8 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-lg lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Online Users Stats */}
        {!isSidebarCollapsed && (
          <div className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Online Users
                </span>
                <Circle className="w-2 h-2 text-green-500 fill-current animate-pulse" />
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-600 dark:text-green-400">
                    {onlineStats.total_online}
                  </div>
                  <div className="text-xs text-slate-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {onlineStats.authenticated_users}
                  </div>
                  <div className="text-xs text-slate-500">Users</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-600 dark:text-gray-400">
                    {onlineStats.anonymous_users}
                  </div>
                  <div className="text-xs text-slate-500">Guests</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {Object.entries(groupedNavItems).map(([category, items]) => (
            <div key={category}>
              {!isSidebarCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                        isActive
                          ? "bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 text-primary dark:text-primary border border-primary/20 shadow-lg shadow-primary/10"
                          : "hover:bg-slate-100/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:scale-105"
                      )}
                      title={isSidebarCollapsed ? item.name : undefined}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <span
                        className={cn(
                          "transition-colors duration-200 flex-shrink-0",
                          isActive
                            ? "text-primary"
                            : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                        )}
                      >
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && (
                        <span className="ml-3 flex-1">{item.name}</span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavItem"
                          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 rounded-xl -z-10"
                          initial={false}
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 p-4 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
          {!isSidebarCollapsed ? (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="font-medium text-white text-sm">
                  {user?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user?.full_name || "Admin"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Administrator
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="font-medium text-white text-sm">
                  {user?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "A"}
                </span>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            className={cn(
              "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200",
              isSidebarCollapsed
                ? "w-10 h-10 p-0"
                : "w-full justify-start gap-2"
            )}
            onClick={handleSignOut}
            title={isSidebarCollapsed ? "Sign Out" : undefined}
          >
            <LogOut size={16} />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>

      {/* Main content wrapper - FIXED: Proper margin calculation */}
      <div
        className={cn(
          "flex-1 transition-all duration-300 flex flex-col min-h-screen",
          isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {/* Enhanced Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </Button>

            {/* Page title */}
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                {pathname
                  .split("/")
                  .pop()
                  ?.replace("-", " ")
                  .replace(/^\w/, (c) => c.toUpperCase()) || "Dashboard"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your portfolio and blog
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu
              open={notificationsPanelOpen}
              onOpenChange={setNotificationsPanelOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b">
                  <h4 className="font-medium">Notifications</h4>
                  {unreadCount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {unreadCount} unread notification
                      {unreadCount > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          "p-3 cursor-pointer block",
                          !notification.is_read &&
                            "bg-blue-50/50 dark:bg-blue-900/10"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={cn(
                              "mt-0.5",
                              getNotificationColor(
                                notification.type,
                                notification.priority
                              )
                            )}
                          >
                            {getNotificationIcon(
                              notification.type,
                              notification.icon
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-slate-500">
                                {new Date(
                                  notification.created_at
                                ).toLocaleDateString()}
                              </p>
                              {!notification.is_read && (
                                <Circle className="w-2 h-2 text-blue-500 fill-current" />
                              )}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Online Users */}
            <OnlineUsersNavbar 
              recentUsers={onlineStats.recent_users} 
              className="transition-all duration-200 hover:scale-105"
            />
            
            {/* Theme Toggle */}
            <ModeToggle />

            {/* View Site */}
            <Button asChild variant="outline" size="sm">
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <Home className="w-4 h-4 mr-2" />
                View Site
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-purple-600 to-blue-600 flex items-center justify-center">
                    <span className="font-medium text-white text-xs">
                      {user?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "A"}
                    </span>
                  </div>
                  <span className="hidden md:block font-medium">
                    {user?.full_name || "Admin"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" target="_blank" rel="noopener noreferrer">
                    <Home className="mr-2 h-4 w-4" />
                    View Site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-gradient-to-br from-slate-50/50 via-white/30 to-slate-100/50 dark:from-slate-950/50 dark:via-slate-900/30 dark:to-slate-800/50">
          {children}
        </main>

        {/* FIXED: Admin Footer with proper positioning */}
        <footer className="border-t border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div>
                © {new Date().getFullYear()} Admin Dashboard. All rights
                reserved.
              </div>
              <div className="flex items-center space-x-4">
                <span>Made with ❤️ by Raihan Sharif</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
