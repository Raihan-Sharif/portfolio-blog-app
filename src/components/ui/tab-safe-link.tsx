// Create this component: src/components/ui/tab-safe-link.tsx
"use client";

import { useRouter } from "next/navigation";
import { MouseEvent, ReactNode } from "react";

interface TabSafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  target?: "_blank" | "_self";
  rel?: string;
  title?: string;
}

export function TabSafeLink({
  href,
  children,
  className,
  target = "_blank",
  rel = "noopener noreferrer",
  title,
}: TabSafeLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // For external links or _blank targets, use normal behavior
    if (target === "_blank" || href.startsWith("http")) {
      return; // Let the browser handle it normally
    }

    // For internal navigation, use Next.js router
    e.preventDefault();
    router.push(href);
  };

  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? rel : undefined}
      className={className}
      title={title}
      onClick={handleClick}
      // Prevent the link from interfering with the current tab's state
      onMouseDown={(e) => {
        if (target === "_blank") {
          // For new tab links, ensure we don't interfere with current tab
          e.stopPropagation();
        }
      }}
    >
      {children}
    </a>
  );
}
