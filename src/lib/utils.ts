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

// Format date - hydration-safe
export function formatDate(date: string | Date): string {
  try {
    const dateObj = new Date(date);
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
}

// Hydration-safe date formatter that returns consistent results
export function formatDateSafe(date: string | Date): string {
  if (typeof window === 'undefined') {
    // Server-side: return a simple format to avoid hydration mismatch
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    } catch {
      return "Invalid Date";
    }
  }
  
  // Client-side: use the full formatter
  return formatDate(date);
}

// Generate consistent random-like values for hydration
export function createStableRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0-1
}

// Generate loading skeleton widths that are consistent during SSR
export function getSkeletonWidth(index: number, baseWidth = 60): string {
  const variation = createStableRandom(`skeleton-${index}`) * 40;
  return `${baseWidth + variation}%`;
}

// Generate loading skeleton heights that are consistent during SSR  
export function getSkeletonHeight(index: number, baseHeight = 40): string {
  const variation = createStableRandom(`skeleton-height-${index}`) * 60;
  return `${baseHeight + variation}%`;
}

// Read time estimator for blog posts
export function getReadTime(content: string): number {
  if (!content || typeof content !== "string") return 1;

  // Remove HTML tags if present
  const cleanContent = content.replace(/<[^>]*>/g, "");

  // Split by whitespace and filter out empty strings
  const words = cleanContent.split(/\s+/).filter((word) => word.length > 0);

  if (words.length === 0) return 1;

  // Average reading speed: 200-250 words per minute for adults
  const wordsPerMinute = 225;
  const readTime = Math.ceil(words.length / wordsPerMinute);

  // Minimum 1 minute read time
  return Math.max(readTime, 1);
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
