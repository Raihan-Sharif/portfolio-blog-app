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
import { ModeToggle } from "@/components/ui/mode-toggle";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Admin role caching
  const [isAdmin, setIsAdmin] = useState(false);
  const adminCheckCache = useRef<
    Map<string, { status: boolean; timestamp: number }>
  >(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    // Clear admin cache
    if (user?.id) {
      adminCheckCache.current.delete(user.id);
    }
    await signOut();
    router.push("/");
  };

  // Optimized admin check with aggressive caching
  const checkAdminRole = useCallback(
    async (userId: string) => {
      // Check memory cache first
      const cached = adminCheckCache.current.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.status;
      }

      // If user has role from auth context, use it directly
      if (user?.role === "admin") {
        const adminStatus = true;
        adminCheckCache.current.set(userId, {
          status: adminStatus,
          timestamp: Date.now(),
        });
        return adminStatus;
      }

      // Check sessionStorage
      const sessionKey = `admin_status_${userId}`;
      const sessionCached = sessionStorage.getItem(sessionKey);
      const sessionTimestamp = sessionStorage.getItem(`${sessionKey}_time`);

      if (sessionCached && sessionTimestamp) {
        const timestamp = parseInt(sessionTimestamp);
        if (Date.now() - timestamp < CACHE_DURATION) {
          const status = sessionCached === "true";
          adminCheckCache.current.set(userId, {
            status,
            timestamp: Date.now(),
          });
          return status;
        }
      }

      try {
        const { data, error } = await supabase.rpc("get_user_with_role", {
          p_user_id: userId,
        });

        const adminStatus =
          !error && data && data.length > 0 && data[0].role_name === "admin";

        // Cache the result in both memory and session storage
        adminCheckCache.current.set(userId, {
          status: adminStatus,
          timestamp: Date.now(),
        });
        sessionStorage.setItem(sessionKey, adminStatus.toString());
        sessionStorage.setItem(`${sessionKey}_time`, Date.now().toString());

        return adminStatus;
      } catch (err) {
        console.error("Error checking role:", err);
        return false;
      }
    },
    [user?.role]
  );

  // Check admin role when user changes
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const initAdminCheck = async () => {
      const adminStatus = await checkAdminRole(user.id);
      setIsAdmin(adminStatus);
    };

    initAdminCheck();
  }, [user, checkAdminRole]);

  // Base navigation links
  const baseNavLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/skills", label: "Skills" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const navbarClasses = cn("fixed w-full z-50 transition-all duration-300", {
    "bg-background/80 backdrop-blur-md shadow-md": isScrolled,
    "bg-transparent": !isScrolled,
  });

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Raihan Sharif</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {baseNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}

              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <User size={16} />
                            <span className="hidden lg:inline">
                              {user.full_name || "Account"}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href="/profile">Profile</Link>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem asChild>
                              <Link href="/admin/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign Out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <Link href="/sign-in">
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </>
              )}
              <ModeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <ModeToggle />
            {!loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <User size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background/95 backdrop-blur-md shadow-lg"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {baseNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={closeMenu}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Admin Dashboard
                </Link>
              )}
              {!loading && !user && (
                <Link
                  href="/sign-in"
                  onClick={closeMenu}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
