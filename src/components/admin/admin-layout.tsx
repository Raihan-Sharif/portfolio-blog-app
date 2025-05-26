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
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const hasCheckedAdmin = useRef(false);

  // Simplified admin check - only run once
  useEffect(() => {
    if (hasCheckedAdmin.current || loading) return;

    const checkAdmin = async () => {
      if (!user) {
        router.push("/sign-in?redirect=" + encodeURIComponent(pathname));
        return;
      }

      try {
        // Check cached admin status first
        const cachedStatus = sessionStorage.getItem(`admin_${user.id}`);
        if (cachedStatus === "true") {
          setIsAdmin(true);
          setCheckingAdmin(false);
          return;
        }

        // If user has role from auth context, use it
        if (user.role === "admin") {
          setIsAdmin(true);
          sessionStorage.setItem(`admin_${user.id}`, "true");
          setCheckingAdmin(false);
          return;
        }

        // Check with database
        const { data, error } = await supabase.rpc("get_user_with_role", {
          p_user_id: user.id,
        });

        if (
          !error &&
          data &&
          data.length > 0 &&
          data[0].role_name === "admin"
        ) {
          setIsAdmin(true);
          sessionStorage.setItem(`admin_${user.id}`, "true");
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Admin check error:", err);
        router.push("/");
      } finally {
        setCheckingAdmin(false);
        hasCheckedAdmin.current = true;
      }
    };

    checkAdmin();
  }, [user, loading, router, pathname]);

  const handleSignOut = useCallback(async () => {
    sessionStorage.removeItem(`admin_${user?.id}`);
    await signOut();
    router.push("/");
  }, [user, signOut, router]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <Home size={18} /> },
    { name: "Blog Posts", href: "/admin/blog", icon: <FileText size={18} /> },
    {
      name: "Projects",
      href: "/admin/projects",
      icon: <Briefcase size={18} />,
    },
    { name: "Users", href: "/admin/users", icon: <Users size={18} /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
  ];

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

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
                    .toUpperCase() || "U"}
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
                <Link href="/">View Site</Link>
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
