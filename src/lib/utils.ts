import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Creates a slug from a string
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

// Format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Read time estimator for blog posts
export function getReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/g).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Get initials from name
export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

// Truncate text
export function truncateText(text: string, length: number): string {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

// Ensure URL path is valid
export function ensureValidPath(path: string): string {
  // Make sure path starts with /
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  // Remove any double slashes
  path = path.replace(/\/+/g, "/");

  return path;
}

// Check if URL is absolute (has protocol)
export function isAbsoluteUrl(url: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(url);
}

// Safely navigate to a URL - ensures URLs are properly formatted
export function safeNavigate(router: any, url: string) {
  if (isAbsoluteUrl(url)) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    router.push(ensureValidPath(url));
  }
}

// This prevents session conflicts between tabs

export class SessionManager {
  private static instance: SessionManager;
  private tabId: string;
  private isOriginalTab: boolean;

  private constructor() {
    this.tabId = this.generateTabId();
    this.isOriginalTab = this.checkIfOriginalTab();
    this.setupTabCommunication();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private checkIfOriginalTab(): boolean {
    const existingTabId = sessionStorage.getItem("activeTabId");
    if (!existingTabId) {
      sessionStorage.setItem("activeTabId", this.tabId);
      return true;
    }
    return false;
  }

  private setupTabCommunication(): void {
    // Listen for tab close events
    window.addEventListener("beforeunload", () => {
      if (this.isOriginalTab) {
        sessionStorage.removeItem("activeTabId");
      }
    });

    // Handle page visibility changes to manage session refreshing
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        // Small delay before refreshing to avoid conflicts
        setTimeout(() => {
          this.handleTabFocus();
        }, 200);
      }
    });

    // Handle window focus
    window.addEventListener("focus", () => {
      setTimeout(() => {
        this.handleTabFocus();
      }, 200);
    });
  }

  private handleTabFocus(): void {
    // Only refresh auth state if this is the original tab or if enough time has passed
    const lastRefresh = localStorage.getItem("lastAuthRefresh");
    const timeSinceLastRefresh = lastRefresh
      ? Date.now() - parseInt(lastRefresh)
      : 0;

    if (this.isOriginalTab || timeSinceLastRefresh > 5000) {
      // Trigger a gentle auth refresh
      this.triggerAuthRefresh();
    }
  }

  private triggerAuthRefresh(): void {
    // Set a flag to indicate we're refreshing
    localStorage.setItem("lastAuthRefresh", Date.now().toString());

    // Dispatch a custom event that the auth provider can listen to
    window.dispatchEvent(
      new CustomEvent("gentleAuthRefresh", {
        detail: { tabId: this.tabId, isOriginal: this.isOriginalTab },
      })
    );
  }

  public preventSessionConflict(callback: () => void): void {
    // Only execute callback if this tab should handle auth operations
    if (this.isOriginalTab) {
      callback();
    }
  }

  public getTabId(): string {
    return this.tabId;
  }

  public isOriginal(): boolean {
    return this.isOriginalTab;
  }
}
