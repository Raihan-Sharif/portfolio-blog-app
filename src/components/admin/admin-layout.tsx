"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          // No session, redirect to login
          router.push("/sign-in");
          return;
        }

        setUser(data.session.user);

        // Check if user has admin role
        const { data: userRoles, error } = await supabase
          .from("user_roles")
          .select("roles(name)")
          .eq("user_id", data.session.user.id)
          .single();

        if (
          error ||
          !userRoles ||
          !userRoles.roles ||
          userRoles.roles.name !== "admin"
        ) {
          // Not an admin, redirect to home
          router.push("/");
          return;
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const menuItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { href: "/admin/blog", label: "Blog", icon: <FileText size={20} /> },
    {
      href: "/admin/projects",
      label: "Projects",
      icon: <Briefcase size={20} />,
    },
    { href: "/admin/users", label: "Users", icon: <Users size={20} /> },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: <Settings size={20} />,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <div className="w-64 bg-card hidden md:block border-r">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Raihan Sharif</span>
            </Link>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                {user?.email ? (
                  <div className="truncate max-w-[180px]">{user.email}</div>
                ) : null}
              </div>
              <ModeToggle />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-30 md:hidden bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
            <Link href="/">
              <span className="text-xl font-bold">Raihan Sharif</span>
            </Link>
          </div>
          <ModeToggle />
        </div>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeMenu}
          ></div>
          <div className="absolute top-0 left-0 w-64 h-full bg-card border-r">
            <div className="p-4 border-b">
              <Link href="/" onClick={closeMenu} className="flex items-center">
                <span className="text-xl font-bold">Raihan Sharif</span>
              </Link>
            </div>
            <nav className="p-4">
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={closeMenu}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t absolute bottom-0 left-0 right-0">
              <div className="text-sm mb-4 truncate">{user?.email || ""}</div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 md:pt-0 pt-16">{children}</div>
    </div>
  );
}
