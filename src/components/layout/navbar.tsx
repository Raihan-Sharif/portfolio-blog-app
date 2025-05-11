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
import { supabase } from "@/lib/supabase/client"; // Import supabase
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme(); // Changed from resolvedTheme to theme

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
    await signOut();
    router.push("/");
  };

  // Check for admin role directly
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      console.log("Current user in navbar:", user);
      console.log("User role in navbar:", user.role);

      // If we already know they're an admin from the context, use that
      if (user.role === "admin") {
        setIsAdmin(true);
        return;
      }

      // Otherwise check directly
      const checkRole = async () => {
        try {
          // Get user role using a more direct approach
          const { data: userRoles } = await supabase
            .from("user_roles")
            .select("role_id")
            .eq("user_id", user.id);

          if (!userRoles || userRoles.length === 0) {
            return;
          }

          // Get the role name
          const { data: roleData } = await supabase
            .from("roles")
            .select("name")
            .eq("id", userRoles[0].role_id)
            .single();

          if (roleData && roleData.name === "admin") {
            setIsAdmin(true);
            console.log("Direct role check in navbar: admin");
          }
        } catch (err) {
          console.error("Error checking role directly:", err);
        }
      };

      checkRole();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

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
