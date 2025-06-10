// src/components/admin/admin-layout.tsx
"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Globe,
  Home,
  Info,
  LogOut,
  Mail,
  Menu,
  Phone,
  Search,
  Settings,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface UserActivity {
  online: number;
  registered: number;
  anonymous: number;
  recent: Array<{
    id: string;
    name: string;
    action: string;
    time: string;
    avatar?: string;
  }>;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity>({
    online: 0,
    registered: 0,
    anonymous: 0,
    recent: [],
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // Admin check logic (simplified for brevity - use your existing logic)
  const hasInitialized = useRef(false);
  const isCheckingAdmin = useRef(false);
  const adminCache = useRef<
    Map<string, { status: boolean; timestamp: number }>
  >(new Map());
  const CACHE_DURATION = 15 * 60 * 1000;

  const checkAdminStatus = useCallback(
    async (userId: string) => {
      // Your existing admin check logic here
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
    },
    [CACHE_DURATION]
  );

  // Initialize admin status
  useEffect(() => {
    if (loading || hasInitialized.current) return;

    if (!user) {
      if (!loading) {
        router.push("/sign-in?redirect=" + encodeURIComponent(pathname));
      }
      return;
    }

    const initializeAdmin = async () => {
      setAdminLoading(true);
      try {
        const adminStatus = await checkAdminStatus(user.id);
        setIsAdmin(adminStatus);
        hasInitialized.current = true;
        if (!adminStatus && !loading) {
          router.push("/");
        }
      } catch (err) {
        console.error("Error initializing admin:", err);
        if (!loading) router.push("/");
      } finally {
        setAdminLoading(false);
      }
    };

    initializeAdmin();
  }, [user, loading, router, pathname, checkAdminStatus]);

  // Fetch real-time notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch recent contact messages
        const { data: messages } = await supabase
          .from("contact_messages")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch recent user registrations
        const { data: recentUsers } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        const mockNotifications: Notification[] = [
          ...(messages?.map((msg) => ({
            id: `msg-${msg.id}`,
            type: "info" as const,
            title: "New Contact Message",
            message: `${msg.name}: ${msg.subject}`,
            time: new Date(msg.created_at).toLocaleTimeString(),
            unread: true,
          })) || []),
          ...(recentUsers?.map((user) => ({
            id: `user-${user.id}`,
            type: "success" as const,
            title: "New User Registration",
            message: `${user.full_name || "Anonymous"} joined`,
            time: new Date(user.created_at).toLocaleTimeString(),
            unread: true,
          })) || []),
        ];

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter((n) => n.unread).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (isAdmin) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Fetch user activity data
  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Mock real-time data (in real app, use WebSocket or real-time subscriptions)
        setUserActivity({
          online: Math.floor(Math.random() * 50) + 10,
          registered: totalUsers || 0,
          anonymous: Math.floor(Math.random() * 20) + 5,
          recent: [
            {
              id: "1",
              name: "John Doe",
              action: "Viewed blog post",
              time: "2 min ago",
            },
            {
              id: "2",
              name: "Jane Smith",
              action: "Downloaded project",
              time: "5 min ago",
            },
            {
              id: "3",
              name: "Anonymous",
              action: "Visited homepage",
              time: "8 min ago",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching user activity:", error);
      }
    };

    if (isAdmin) {
      fetchUserActivity();
      const interval = setInterval(fetchUserActivity, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleSignOut = useCallback(async () => {
    if (user?.id) {
      adminCache.current.delete(user.id);
      sessionStorage.removeItem(`admin_${user.id}`);
      sessionStorage.removeItem(`admin_${user.id}_time`);
    }
    await signOut();
    router.push("/");
  }, [user, signOut, router]);

  // Enhanced navigation with better organization
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <BarChart3 size={20} />,
      category: "main",
      badge:
        userActivity.online > 0 ? userActivity.online.toString() : undefined,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <TrendingUp size={20} />,
      category: "main",
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
      badge:
        userActivity.registered > 0
          ? userActivity.registered.toString()
          : undefined,
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
      badge: unreadCount > 0 ? unreadCount.toString() : undefined,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings size={20} />,
      category: "system",
    },
  ];

  const groupedNavItems = navItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
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

  if (loading || (adminLoading && !hasInitialized.current)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-500 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="text-muted-foreground font-medium">
            Loading admin panel...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen flex">
      {/* Enhanced Sidebar */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 shadow-2xl transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-72",
          !isSidebarOpen && "lg:translate-x-0 -translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-primary/5 to-purple-500/5">
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-slate-900 via-purple-600 to-blue-600 dark:from-white dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-xs text-muted-foreground">
                  Portfolio Dashboard
                </p>
              </div>
            </motion.div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Live Status Indicators */}
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-b border-slate-200/50 dark:border-slate-700/50"
          >
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-500/10 rounded-lg p-2">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Online
                  </span>
                </div>
                <div className="text-sm font-bold text-green-700 dark:text-green-300">
                  {userActivity.online}
                </div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-2">
                <div className="flex items-center justify-center mb-1">
                  <User className="w-3 h-3 text-blue-600 dark:text-blue-400 mr-1" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Users
                  </span>
                </div>
                <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {userActivity.registered}
                </div>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-2">
                <div className="flex items-center justify-center mb-1">
                  <Eye className="w-3 h-3 text-orange-600 dark:text-orange-400 mr-1" />
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    Guests
                  </span>
                </div>
                <div className="text-sm font-bold text-orange-700 dark:text-orange-300">
                  {userActivity.anonymous}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
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
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                          isActive
                            ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <span
                          className={cn(
                            "transition-colors duration-200",
                            isActive
                              ? "text-white"
                              : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                          )}
                        >
                          {item.icon}
                        </span>
                        {!isSidebarCollapsed && (
                          <>
                            <span className="ml-3 flex-1">{item.name}</span>
                            {item.badge && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={cn(
                                  "px-2 py-0.5 text-xs rounded-full font-medium",
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-primary/10 text-primary"
                                )}
                              >
                                {item.badge}
                              </motion.span>
                            )}
                          </>
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-xl"
                            style={{ zIndex: -1 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-slate-200/50 dark:border-slate-700/50 p-4 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50">
          {!isSidebarCollapsed ? (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="font-bold text-white text-sm">
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
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Administrator
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-purple-600 to-blue-600 flex items-center justify-center">
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
              "border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700",
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
      </motion.div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isSidebarCollapsed ? "lg:ml-16" : "lg:ml-72"
        )}
      >
        {/* Enhanced Top Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </Button>

            {/* Enhanced Search */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800/50 rounded-xl px-4 py-2 min-w-[350px] border border-slate-200/50 dark:border-slate-700/50">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search dashboard, analytics, users..."
                className="bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 flex-1"
              />
              <kbd className="px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 rounded text-slate-500 dark:text-slate-400">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Activity Indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                {userActivity.online} online
              </span>
            </div>

            {/* Enhanced Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <p className="text-xs text-muted-foreground">
                    You have {unreadCount} unread notifications
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full mt-2",
                            notification.type === "success" && "bg-green-500",
                            notification.type === "info" && "bg-blue-500",
                            notification.type === "warning" && "bg-yellow-500",
                            notification.type === "error" && "bg-red-500"
                          )}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Site */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-2" />
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
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
