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
  Briefcase,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
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
  const { user, loading, signOut, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mountedRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const adminCheckAttempts = useRef(0);
  const lastRefreshTime = useRef<number | null>(null);

  // Check admin status function that can be called independently
  const checkAdminStatus = useCallback(
    async (forceCheck = false) => {
      if (loading) return;

      // If user is null (not authenticated), redirect to sign-in
      if (!user) {
        router.push("/sign-in?redirect=" + encodeURIComponent(pathname));
        return;
      }

      // Use cached admin status if available and not forcing a check
      if (!forceCheck) {
        const cachedAdminStatus = localStorage.getItem("adminStatus");
        if (cachedAdminStatus) {
          try {
            const parsed = JSON.parse(cachedAdminStatus);
            if (
              parsed.userId === user.id &&
              parsed.isAdmin &&
              parsed.timestamp &&
              Date.now() - parsed.timestamp < 5 * 60 * 1000
            ) {
              setIsAdmin(true);
              setCheckingAdmin(false);
              setContentVisible(true);
              return;
            }
          } catch (e) {
            console.error("Error parsing cached admin status:", e);
          }
        }
      }

      // First check the user.role from auth provider - this prevents excessive API calls
      if (user.role === "admin") {
        setIsAdmin(true);
        setCheckingAdmin(false);
        setContentVisible(true);

        // Cache the admin status to prevent future checks
        localStorage.setItem(
          "adminStatus",
          JSON.stringify({
            userId: user.id,
            isAdmin: true,
            timestamp: Date.now(),
          })
        );
        return;
      }

      // CRITICAL FIX: Limit API calls for role checking
      // If we've already checked recently (in the last 30 seconds), don't check again
      const lastCheckTime = localStorage.getItem("lastAdminRoleCheck");
      if (lastCheckTime && !forceCheck) {
        const lastCheck = parseInt(lastCheckTime);
        if (Date.now() - lastCheck < 30000) {
          // 30 seconds
          // If we already determined they're not admin in recent memory, redirect
          if (adminCheckAttempts.current > 2) {
            router.push("/");
            return;
          }
          setCheckingAdmin(false);
          return;
        }
      }

      // Save the time of this check
      localStorage.setItem("lastAdminRoleCheck", Date.now().toString());

      // If that doesn't work, check directly with our RPC function
      try {
        adminCheckAttempts.current += 1;
        const { data, error } = await supabase.rpc("get_user_with_role", {
          p_user_id: user.id,
        });

        if (error) {
          console.error("Error checking admin role:", error);

          // If we've tried a few times and still getting errors, redirect
          if (adminCheckAttempts.current > 3) {
            router.push("/");
          }
          return;
        }

        if (data && data.length > 0 && data[0].role_name === "admin") {
          setIsAdmin(true);
          // Cache the admin status
          localStorage.setItem(
            "adminStatus",
            JSON.stringify({
              userId: user.id,
              isAdmin: true,
              timestamp: Date.now(),
            })
          );
        } else {
          console.log("User does not have admin role");
          // Cache the non-admin status
          localStorage.setItem(
            "adminStatus",
            JSON.stringify({
              userId: user.id,
              isAdmin: false,
              timestamp: Date.now(),
            })
          );
          router.push("/");
        }
      } catch (err) {
        console.error("Error in admin check:", err);
        if (adminCheckAttempts.current > 3) {
          router.push("/");
        }
      } finally {
        setCheckingAdmin(false);
      }
    },
    [user, loading, router, pathname]
  );

  // Function to handle visibility changes (when tab becomes active)
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      // Only refresh if it's been at least 30 seconds since the last refresh
      const now = Date.now();
      if (!lastRefreshTime.current || now - lastRefreshTime.current > 30000) {
        refreshUser();
        lastRefreshTime.current = now;
      }
    }
  }, [refreshUser]);

  // Set up visibility change listener
  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Setup cross-tab storage sync
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === "authSession" ||
        event.key === "authUserDetails" ||
        event.key === "adminStatus"
      ) {
        // Force a refresh of auth state
        refreshUser();
        checkAdminStatus(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshUser, checkAdminStatus]);

  // This is to prevent the flashing of content during authentication checks
  useEffect(() => {
    if (!checkingAdmin && !contentVisible) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Set a new timeout
      loadingTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setContentVisible(true);
        }
      }, 100);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [checkingAdmin, contentVisible]);

  // Improved admin check with caching
  useEffect(() => {
    mountedRef.current = true;
    checkAdminStatus();

    // Set up periodic checking for long-lived pages
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        checkAdminStatus(true); // Force a fresh check every 5 minutes
      }
    }, 5 * 60 * 1000);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [checkAdminStatus]);

  // Handle manual page refresh to reset the content visibility state
  useEffect(() => {
    const handleBeforeUnload = () => {
      // This will run before page refresh/navigation
      localStorage.setItem("admin_last_path", pathname);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Check if we're returning to the same path after a refresh
    const lastPath = localStorage.getItem("admin_last_path");
    if (lastPath === pathname) {
      // If returning to the same path, make content visible immediately
      setContentVisible(true);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);

  const handleSignOut = async () => {
    // Clear cached data first
    localStorage.removeItem("adminStatus");
    localStorage.removeItem("authSession");
    localStorage.removeItem("authUserDetails");

    await signOut();
    router.push("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <Home size={18} />,
    },
    {
      name: "Blog Posts",
      href: "/admin/blog",
      icon: <FileText size={18} />,
    },
    {
      name: "Projects",
      href: "/admin/projects",
      icon: <Briefcase size={18} />,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <Users size={18} />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings size={18} />,
    },
  ];

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in the effect
  }

  // Force immediate display of content if we're on an admin page
  // This helps when navigating between admin pages
  const forceDisplay = contentVisible || pathname.startsWith("/admin/");

  return (
    <div className="bg-background min-h-screen flex">
      {/* Sidebar Toggle for Mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-background"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10 transform transition-transform duration-200 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0" // Always visible on desktop
        )}
      >
        <div className="flex flex-col flex-grow border-r bg-card pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Link href="/" className="font-bold text-lg">
              Admin Panel
            </Link>
          </div>
          <div className="flex flex-col flex-grow">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div
                      className={`mr-3 ${
                        isActive ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="px-4 pb-4">
            <div className="flex items-center px-2 py-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                  <span className="font-medium">
                    {user?.full_name
                      ? user.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">
                  {user?.full_name || "Admin User"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.role || "Administrator"}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 mt-2"
              onClick={handleSignOut}
              type="button"
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main content - only render when authentication is complete */}
      <div
        className={cn(
          "flex flex-col flex-1 w-full transition-all duration-200 ease-in-out",
          isSidebarOpen ? "md:pl-64" : "pl-0"
        )}
      >
        <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-background border-b flex items-center justify-end px-4 md:px-8">
          <div className="ml-auto flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user?.email}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-4">
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">View Site</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {forceDisplay ? (
          <main className="flex-1 pt-4">{children}</main>
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p>Loading content...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
