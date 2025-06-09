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
  Briefcase,
  FileText,
  Home,
  Info,
  LogOut,
  Mail,
  Menu,
  Phone,
  Settings,
  Star,
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

  // Refs for better state management
  const hasInitialized = useRef(false);
  const isCheckingAdmin = useRef(false);
  const adminCache = useRef<
    Map<string, { status: boolean; timestamp: number }>
  >(new Map());
  const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache

  // Optimized admin check with aggressive caching
  const checkAdminStatus = useCallback(
    async (userId: string) => {
      // Check cache first
      const cached = adminCache.current.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.status;
      }

      // Prevent concurrent checks
      if (isCheckingAdmin.current) {
        return null;
      }

      isCheckingAdmin.current = true;

      try {
        // Quick check from user role first
        if (user?.role === "admin") {
          const adminStatus = true;
          adminCache.current.set(userId, {
            status: adminStatus,
            timestamp: Date.now(),
          });
          return adminStatus;
        }

        // Check sessionStorage for faster access
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

        // Database check as last resort
        const { data, error } = await supabase.rpc("get_user_with_role", {
          p_user_id: userId,
        });

        const adminStatus =
          !error && data && data.length > 0 && data[0].role_name === "admin";

        // Cache the result
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
    [user?.role, CACHE_DURATION] // Add CACHE_DURATION dependency
  );

  // Initialize admin status only once
  useEffect(() => {
    if (loading || hasInitialized.current) return;

    if (!user) {
      // Only redirect if we've finished loading and there's no user
      if (!loading) {
        router.push("/sign-in?redirect=" + encodeURIComponent(pathname));
      }
      return;
    }

    const initializeAdmin = async () => {
      // Don't show loading for navigation between admin pages
      const shouldShowLoading = !hasInitialized.current;

      if (shouldShowLoading) {
        setAdminLoading(true);
      }

      try {
        const adminStatus = await checkAdminStatus(user.id);

        if (adminStatus !== null) {
          setIsAdmin(adminStatus);
          hasInitialized.current = true;

          // Only redirect if not admin and we're sure about the status
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

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    if (user?.id) {
      adminCache.current.delete(user.id);
      sessionStorage.removeItem(`admin_${user.id}`);
      sessionStorage.removeItem(`admin_${user.id}_time`);
    }

    await signOut();
    router.push("/");
  }, [user, signOut, router]);

  // Navigation items
  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <Home size={18} /> },
    { name: "Blog Posts", href: "/admin/blog", icon: <FileText size={18} /> },
    {
      name: "Projects",
      href: "/admin/projects",
      icon: <Briefcase size={18} />,
    },
    {
      name: "Hero Section",
      href: "/admin/hero",
      icon: <Star size={18} />,
    },
    { name: "Users", href: "/admin/users", icon: <Users size={18} /> },
    {
      name: "Contact",
      href: "/admin/contact-management",
      icon: <Phone size={18} />,
    },
    { name: "Messages", href: "/admin/contact", icon: <Mail size={18} /> },
    { name: "About Page", href: "/admin/about", icon: <Info size={18} /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
  ];

  // Show loading only during initial admin check, not during navigation
  if (loading || (adminLoading && !hasInitialized.current)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  // Don't render anything if user is not admin (redirect will happen)
  if (hasInitialized.current && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show admin layout only if user is confirmed admin
  if (!hasInitialized.current || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="bg-background min-h-screen flex">
      {/* Mobile sidebar toggle */}
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
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-4 border-b">
            <Link href="/" className="font-bold text-lg">
              Admin Panel
            </Link>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                  onClick={() => {
                    // Close mobile sidebar on navigation
                    if (window.innerWidth < 768) {
                      setIsSidebarOpen(false);
                    }
                  }}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <span className="font-medium text-sm">
                  {user?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "A"}
                </span>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">
                  {user?.full_name || "Admin"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Administrator
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-20 h-16 bg-background border-b px-4 flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" target="_blank" rel="noopener noreferrer">
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
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
