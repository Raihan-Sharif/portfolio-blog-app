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
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    // For admin routes, render children directly (AdminLayout handles its own layout)
    return <>{children}</>;
  }

  // For non-admin routes, use the standard layout
  return (
    <div className="flex min-h-screen flex-col">
      {navbar}
      <main className="flex-1 pt-16">{children}</main>
      {footer}
    </div>
  );
}
