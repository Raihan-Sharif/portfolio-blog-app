// src/components/layout/conditional-layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface ConditionalLayoutProps {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
}

export default function ConditionalLayout({
  children,
  navbar,
  footer,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current route is an admin route
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    // For admin routes, render children directly without navbar/footer
    // AdminLayout component will handle its own layout structure
    return <div className="admin-page">{children}</div>;
  }

  // For non-admin routes, use the standard layout with navbar and footer
  return (
    <div className="relative flex min-h-screen flex-col">
      {navbar}
      <main className="flex-1 pt-16">{children}</main>
      {footer}
    </div>
  );
}
