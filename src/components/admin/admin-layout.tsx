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
import {
  BarChart3,
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Info,
  LogOut,
  Mail,
  Menu,
  Phone,
  Search,
  Settings,
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

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Admin check logic (same as before)
  const hasInitialized = useRef(false);
  const isCheckingAdmin = useRef(false);
  const adminCache = useRef<
    Map<string, { status: boolean; timestamp: number }>
  >(new Map());
  const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache

  const checkAdminStatus = useCallback(
    async (userId: string) => {
      const cached = adminCache.current.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.status;
      }

      if (isCheckingAdmin.current) {
        return null;
      }

      isCheckingAdmin.current = true;

      try {
        if (user?.role === "admin") {
          const adminStatus = true;
          adminCache.current.set(userId, {
            status: adminStatus,
            timestamp: Date.now(),
          });
          return adminStatus;
        }

        const sessionKey = `admin_${userId}`;
        const sessionData = sessionStorage.getItem(sessionKey);
        const sessionTime = sessionStorage.getItem(`${sessionKey}_time`);

        if (sessionData && sessionTime) {
          const timestamp = parseInt(sessionTime);
          if (Date.now() - timestamp < CACHE_DURATION) {
            const status = sessionData === "true";
            adminCache.current.set(userId, { status, timestamp: Date.now() });
            return status;
          }
        }

        const { data, error } = await supabase.rpc("get_user_with_role", {
          p_user_id: userId,
        });

        const adminStatus =
          !error && data && data.length > 0 && data[0].role_name === "admin";

        adminCache.current.set(userId, {
          status: adminStatus,
          timestamp: Date.now(),
        });
        sessionStorage.setItem(sessionKey, adminStatus.toString());
        sessionStorage.setItem(`${sessionKey}_time`, Date.now().toString());

        return adminStatus;
      } catch (err) {
        console.error("Error checking admin status:", err);
        return false;
      } finally {
        isCheckingAdmin.current = false;
      }
    },
    [user?.role, CACHE_DURATION]
  );

  useEffect(() => {
    if (loading || hasInitialized.current) return;

    if (!user) {
      if (!loading) {
        router.push("/sign-in?redirect=" + encodeURIComponent(pathname));
      }
      return;
    }

    const initializeAdmin = async () => {
      const shouldShowLoading = !hasInitialized.current;

      if (shouldShowLoading) {
        setAdminLoading(true);
      }

      try {
        const adminStatus = await checkAdminStatus(user.id);

        if (adminStatus !== null) {
          setIsAdmin(adminStatus);
          hasInitialized.current = true;

          if (!adminStatus && !loading) {
            router.push("/");
          }
        }
      } catch (err) {
        console.error("Error initializing admin:", err);
        if (!loading) {
          router.push("/");
        }
      } finally {
        if (shouldShowLoading) {
          setAdminLoading(false);
        }
      }
    };

    initializeAdmin();
  }, [user, loading, router, pathname, checkAdminStatus]);

  const handleSignOut = useCallback(async () => {
    if (user?.id) {
      adminCache.current.delete(user.id);
      sessionStorage.removeItem(`admin_${user.id}`);
      sessionStorage.removeItem(`admin_${user.id}_time`);
    }

    await signOut();
    router.push("/");
  }, [user, signOut, router]);

  // Navigation items with better organization
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <BarChart3 size={20} />,
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
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings size={20} />,
      category: "system",
    },
  ];

  // Group navigation items by category
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

  if (loading || (adminLoading && !hasInitialized.current)) {
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

  if (!user) {
    return null;
  }

  if (hasInitialized.current && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!hasInitialized.current || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">
            Verifying permissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300",
          // FIXED: Higher z-index to ensure sidebar is on top
          "z-[60]",
          isSidebarCollapsed ? "w-16" : "w-64",
          !isSidebarOpen && "lg:translate-x-0 -translate-x-full"
        )}
      >
        {/* Sidebar Header - FIXED: Removed potential overlap */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

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
                        "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/25"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      )}
                      title={isSidebarCollapsed ? item.name : undefined}
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
                        <span className="ml-3">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
          {!isSidebarCollapsed ? (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
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
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-[70]">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-white dark:bg-slate-800 shadow-lg"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[50]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          // FIXED: Proper margin to prevent overlap
          isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-6 flex items-center justify-between">
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

            {/* Search */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 min-w-[300px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 flex-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
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

        {/* Main Content Area - FIXED: Proper z-index and positioning */}
        <main className="flex-1 p-6 relative z-10 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
