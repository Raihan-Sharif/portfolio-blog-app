// src/components/layout/navbar.tsx
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
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading, signOut, isAdmin, isEditor } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Enhanced sign out with loading state
  const [isSigningOut, setIsSigningOut] = useState(false);
  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      closeMenu();
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut, router]);

  // Navigation items
  const navigationItems = [
    { name: "Home", href: "/", current: pathname === "/" },
    { name: "About", href: "/about", current: pathname === "/about" },
    {
      name: "Projects",
      href: "/projects",
      current: pathname.startsWith("/projects"),
    },
    {
      name: "Skills",
      href: "/skills",
      current: pathname.startsWith("/skills"),
    },
    { name: "Services", href: "/services", current: pathname.startsWith("/services") },
    { name: "Blog", href: "/blog", current: pathname.startsWith("/blog") },
    { name: "Newsletter", href: "/subscribe", current: pathname === "/subscribe" },
    { name: "Contact", href: "/contact", current: pathname === "/contact" },
  ];

  // Get user role info (keeping for future use if needed)
  // const getRoleInfo = () => {
  //   if (isAdmin) {
  //     return { label: "Admin", color: "text-red-600", icon: Shield };
  //   }
  //   if (isEditor) {
  //     return { label: "Editor", color: "text-blue-600", icon: Edit3 };
  //   }
  //   return { label: "User", color: "text-gray-600", icon: Eye };
  // };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              Portfolio
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    item.current
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Auth & Settings */}
          <div className="hidden md:flex items-center space-x-4">
            <ModeToggle />

            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-auto min-h-12 px-3 py-2 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 hover:from-slate-100 hover:to-slate-150 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Enhanced Avatar */}
                      <div className="relative">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary to-purple-600 text-white text-sm font-bold shadow-lg ring-2 ring-white dark:ring-slate-800">
                          {user.full_name
                            ? user.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            : user.email?.[0].toUpperCase() || "U"}
                        </div>
                        {/* Online status indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                      </div>
                      
                      {/* User Info */}
                      <div className="flex flex-col items-start text-left min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-32">
                            {user.full_name || "Anonymous User"}
                          </span>
                          {(isAdmin || isEditor) && (
                            <span
                              className={cn(
                                "px-2 py-0.5 text-xs font-medium rounded-full",
                                isAdmin
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              )}
                            >
                              {isAdmin ? "Admin" : "Editor"}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-32">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="end" forceMount>
                  {/* Enhanced User Info Header */}
                  <div className="flex items-center justify-start gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <div className="relative">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary to-purple-600 text-white text-sm font-bold shadow-lg">
                        {user.full_name
                          ? user.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : user.email?.[0].toUpperCase() || "U"}
                      </div>
                      {/* Online status indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    </div>
                    <div className="flex flex-col space-y-1 leading-none min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base text-slate-900 dark:text-white truncate">
                          {user.full_name || "Anonymous User"}
                        </p>
                        {(isAdmin || isEditor) && (
                          <span
                            className={cn(
                              "px-2 py-0.5 text-xs font-medium rounded-full",
                              isAdmin
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            )}
                          >
                            {isAdmin ? "Admin" : "Editor"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Online</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Navigation Items */}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  {(isAdmin || isEditor) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/dashboard"
                          className="cursor-pointer"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                          {isAdmin && (
                            <span className="ml-auto text-xs text-red-600">
                              Admin
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  {/* Sign Out */}
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
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
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                    item.current
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Auth Section */}
              {user ? (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex items-center px-3 mb-3">
                    <div className="flex-shrink-0 relative">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary via-primary to-purple-600 text-white text-sm font-bold shadow-lg">
                        {user.full_name
                          ? user.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : user.email?.[0].toUpperCase() || "U"}
                      </div>
                      {/* Online status indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-base font-semibold truncate">
                          {user.full_name || "Anonymous User"}
                        </div>
                        {(isAdmin || isEditor) && (
                          <span
                            className={cn(
                              "px-2 py-0.5 text-xs font-medium rounded-full",
                              isAdmin
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            )}
                          >
                            {isAdmin ? "Admin" : "Editor"}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>

                  {(isAdmin || isEditor) && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                      onClick={closeMenu}
                    >
                      Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-2">
                  <Link
                    href="/sign-in"
                    className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={closeMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground"
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Theme Toggle */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 px-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Theme</span>
                  <ModeToggle />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
