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
