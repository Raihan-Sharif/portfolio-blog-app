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
import { useEffect, useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (loading) return;

      if (!user) {
        router.push("/sign-in");
        return;
      }

      // First check the user.role from auth provider
      if (user.role === "admin") {
        setIsAdmin(true);
        setCheckingAdmin(false);
        return;
      }

      // If that doesn't work, check directly with the database
      try {
        // Get user role using a more direct approach
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", user.id);

        if (!userRoles || userRoles.length === 0) {
          console.log("No roles found for user");
          router.push("/");
          return;
        }

        // Get the role name
        const { data: roleData } = await supabase
          .from("roles")
          .select("name")
          .eq("id", userRoles[0].role_id)
          .single();

        if (!roleData || roleData.name !== "admin") {
          console.log("User does not have admin role");
          router.push("/");
          return;
        }

        setIsAdmin(true);
      } catch (err) {
        console.error("Error in admin check:", err);
        router.push("/");
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, loading, router]);

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
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in the effect
  }

  return (
    <div className="bg-background min-h-screen flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-card pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Link href="/" className="font-bold text-lg">
              Admin Panel
            </Link>
          </div>
          <div className="flex flex-col flex-grow">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
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
      <div className="md:hidden bg-card border-b px-4 py-2 flex items-center justify-between">
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

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1 w-full">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
