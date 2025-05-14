"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import {
  Briefcase,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
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
  const mountedRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to handle visibility changes (when tab becomes active)
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      refreshUser();
    }
  }, [refreshUser]);

  // Set up visibility change listener
  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Set up manual polling for auth state when tab is active
  useEffect(() => {
    mountedRef.current = true;

    // Implement a gentle polling mechanism to periodically check auth state
    // when the tab is visible and in the admin section
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible" && mountedRef.current) {
        refreshUser();
      }
    }, 30000); // Poll every 30 seconds when tab is visible

    return () => {
      mountedRef.current = false;
      clearInterval(pollInterval);
    };
  }, [refreshUser]);

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

  // Check admin status
  useEffect(() => {
    let isMounted = true;

    const checkAdminStatus = async () => {
      if (loading) return;

      // If user is null (not authenticated), redirect to sign-in
      if (!user) {
        router.push("/sign-in?redirect=" + encodeURIComponent(pathname));
        return;
      }

      // First check the user.role from auth provider
      if (user.role === "admin") {
        if (isMounted) {
          setIsAdmin(true);
          setCheckingAdmin(false);
        }
        return;
      }

      // If that doesn't work, check directly with our RPC function
      try {
        const { data, error } = await supabase.rpc("get_user_with_role", {
          p_user_id: user.id,
        });

        if (error) {
          console.error("Error checking admin role:", error);
          if (isMounted) {
            router.push("/");
          }
          return;
        }

        if (data && data.length > 0 && data[0].role_name === "admin") {
          if (isMounted) {
            setIsAdmin(true);
          }
        } else {
          console.log("User does not have admin role, redirecting");
          if (isMounted) {
            router.push("/");
          }
        }
      } catch (err) {
        console.error("Error in admin check:", err);
        if (isMounted) {
          router.push("/");
        }
      } finally {
        if (isMounted) {
          setCheckingAdmin(false);
        }
      }
    };

    checkAdminStatus();

    return () => {
      isMounted = false;
    };
  }, [user, loading, router, pathname]);

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
    await signOut();
    router.push("/");
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
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
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

      {/* Mobile header */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-20 bg-card border-b px-4 py-2 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          Admin Panel
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          type="button"
        >
          <LogOut size={16} />
        </Button>
      </div>

      {/* Main content - only render when authentication is complete */}
      <div className="md:pl-64 flex flex-col flex-1 w-full pt-16 md:pt-0">
        {forceDisplay ? (
          <main className="flex-1">{children}</main>
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
