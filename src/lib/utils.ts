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
